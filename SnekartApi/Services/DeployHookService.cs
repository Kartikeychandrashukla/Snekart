namespace SnekartApi.Services
{
    public interface IDeployHookTrigger
    {
        // Ask for a frontend rebuild. Calls within the debounce window collapse into one deploy.
        void Request(string reason);
    }

    // The frontend (snekart.in) is pre-rendered at build time: every product, blog post and
    // category page is a static HTML file. After an admin changes one of those, this triggers a
    // Render Deploy Hook so the site is rebuilt with the new content.
    //
    // Debounced: each change pushes the deploy back to DeployHookDelaySeconds (default 120s)
    // after the *last* change, so a bulk edit starts one build, not twenty.
    //
    // Config (Render → snekart-api → Environment):
    //   RenderDeployHookUrl      the static site's Deploy Hook URL (unset = disabled, e.g. locally)
    //   DeployHookDelaySeconds   optional, default 120
    //
    // A deploy that's pending when the API restarts is lost; the weekly scheduled rebuild
    // (.github/workflows/weekly-rebuild.yml) is the safety net for that.
    public sealed class DeployHookService : BackgroundService, IDeployHookTrigger
    {
        private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);

        private readonly IHttpClientFactory _httpFactory;
        private readonly ILogger<DeployHookService> _logger;
        private readonly string? _hookUrl;
        private readonly TimeSpan _delay;

        private readonly object _lock = new();
        private DateTimeOffset? _dueAt;

        public DeployHookService(IHttpClientFactory httpFactory, IConfiguration config, ILogger<DeployHookService> logger)
        {
            _httpFactory = httpFactory;
            _logger = logger;
            _hookUrl = string.IsNullOrWhiteSpace(config["RenderDeployHookUrl"]) ? null : config["RenderDeployHookUrl"]!.Trim();
            _delay = TimeSpan.FromSeconds(int.TryParse(config["DeployHookDelaySeconds"], out var s) && s >= 0 ? s : 120);
        }

        public void Request(string reason)
        {
            if (_hookUrl is null)
            {
                _logger.LogDebug("Deploy hook not configured — ignoring change ({Reason})", reason);
                return;
            }
            lock (_lock) _dueAt = DateTimeOffset.UtcNow + _delay;
            _logger.LogInformation("Content changed ({Reason}); frontend rebuild scheduled in {Delay}s", reason, _delay.TotalSeconds);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_hookUrl is null)
            {
                _logger.LogInformation("RenderDeployHookUrl not set — automatic frontend rebuilds are off");
                return;
            }

            using var timer = new PeriodicTimer(PollInterval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                bool due;
                lock (_lock)
                {
                    due = _dueAt is { } at && at <= DateTimeOffset.UtcNow;
                    if (due) _dueAt = null;
                }
                if (due) await TriggerAsync(stoppingToken);
            }
        }

        private async Task TriggerAsync(CancellationToken ct)
        {
            for (var attempt = 1; attempt <= 3; attempt++)
            {
                try
                {
                    using var http = _httpFactory.CreateClient();
                    http.Timeout = TimeSpan.FromSeconds(30);
                    using var res = await http.PostAsync(_hookUrl, content: null, ct);
                    if (res.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Frontend rebuild triggered (HTTP {Status})", (int)res.StatusCode);
                        return;
                    }
                    _logger.LogWarning("Deploy hook returned HTTP {Status} (attempt {Attempt}/3)", (int)res.StatusCode, attempt);
                }
                catch (Exception ex) when (ex is not OperationCanceledException || !ct.IsCancellationRequested)
                {
                    _logger.LogWarning(ex, "Deploy hook call failed (attempt {Attempt}/3)", attempt);
                }
                if (attempt < 3) await Task.Delay(TimeSpan.FromSeconds(30), ct);
            }
            _logger.LogError("Could not trigger the frontend rebuild after 3 attempts; it will be picked up by the next change or the weekly rebuild");
        }
    }
}
