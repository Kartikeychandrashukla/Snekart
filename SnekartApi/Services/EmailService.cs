using System.Net;
using System.Net.Http.Json;
using System.Text;
using SnekartApi.Models;

namespace SnekartApi.Services
{
    public class EmailService : IEmailService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(HttpClient http, IConfiguration config, ILogger<EmailService> logger)
        {
            _http = http;
            _config = config;
            _logger = logger;
        }

        public async Task SendOrderPlacedEmailsAsync(Order order)
        {
            var apiKey = _config["ResendApiKey"];
            var fromEmail = _config["ResendFromEmail"];
            var adminEmail = _config["AdminNotificationEmail"];

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail))
            {
                _logger.LogWarning("Resend is not configured — skipping order-placed emails for order {OrderId}", order.Id);
                return;
            }

            var itemsHtml = BuildItemsHtml(order);

            await TrySendAsync(
                apiKey, fromEmail, order.Email,
                $"Your Snekart order {order.Id} is confirmed",
                BuildCustomerHtml(order, itemsHtml),
                order.Id);

            if (!string.IsNullOrWhiteSpace(adminEmail))
            {
                await TrySendAsync(
                    apiKey, fromEmail, adminEmail,
                    $"New order placed: {order.Id}",
                    BuildAdminHtml(order, itemsHtml),
                    order.Id);
            }
        }

        public async Task SendNewPostNotificationAsync(BlogPost post, List<NewsletterSubscriber> subscribers)
{
    var apiKey = _config["ResendApiKey"];
    var fromEmail = _config["ResendFromEmail"];
    var apiHost = _config["ApiHost"] ?? "http://localhost:5232";
    var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";

    if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail) || subscribers.Count == 0)
    {
        _logger.LogWarning("Skipping new-post notification for {Slug} — Resend not configured or no subscribers", post.Slug);
        return;
    }

    var postUrl = $"{frontendUrl}/blog/{post.Slug}";

    foreach (var subscriber in subscribers)
    {
        var html = BuildNewPostHtml(post, postUrl, apiHost, subscriber.UnsubscribeToken);
        await TrySendAsync(apiKey, fromEmail, subscriber.Email, $"New on Snekart: {post.Title}", html, post.Slug);
    }
}


        private async Task TrySendAsync(string apiKey, string from, string to, string subject, string html, string orderId)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, "emails")
                {
                    Content = JsonContent.Create(new
                    {
                        from,
                        to = new[] { to },
                        subject,
                        html,
                    }),
                };
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

                var response = await _http.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Resend responded {StatusCode} sending order email for {OrderId}: {Body}",
                        response.StatusCode, orderId, body);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send order email for {OrderId}", orderId);
            }
        }

        private static string BuildItemsHtml(Order order)
        {
            var sb = new StringBuilder();
            foreach (var item in order.Items)
            {
                var name = WebUtility.HtmlEncode(item.Name);
                var tier = WebUtility.HtmlEncode(item.TierLabel);
                sb.Append($"<tr><td>{name} ({tier})</td><td>x{item.Qty}</td><td>₹{item.Price * item.Qty}</td></tr>");
            }
            return sb.ToString();
        }

        private static string BuildCustomerHtml(Order order, string itemsHtml)
        {
            var name = WebUtility.HtmlEncode(order.Name);
            var address = BuildAddressHtml(order);
            return $@"
                <h2>Thanks for your order, {name}!</h2>
                <p>Your order <strong>{order.Id}</strong> has been placed and is being processed.</p>
                <table cellpadding=""6"">{itemsHtml}</table>
                <p><strong>Total: ₹{order.Total}</strong></p>
                <p>Shipping to:<br/>{address}</p>";
        }

        private static string BuildAdminHtml(Order order, string itemsHtml)
        {
            var name = WebUtility.HtmlEncode(order.Name);
            var phone = WebUtility.HtmlEncode(order.Phone);
            var address = BuildAddressHtml(order);
            return $@"
                <h2>New order placed: {order.Id}</h2>
                <p>Customer: {name} ({WebUtility.HtmlEncode(order.Email)}, {phone})</p>
                <table cellpadding=""6"">{itemsHtml}</table>
                <p><strong>Total: ₹{order.Total}</strong></p>
                <p>Shipping to:<br/>{address}</p>";
        }

        private static string BuildAddressHtml(Order order)
        {
            var line = WebUtility.HtmlEncode(order.AddressLine);
            var city = WebUtility.HtmlEncode(order.City);
            var state = WebUtility.HtmlEncode(order.State);
            var pincode = WebUtility.HtmlEncode(order.Pincode);
            return $"{line}, {city}, {state} {pincode}";
        }

        private static string BuildNewPostHtml(BlogPost post, string postUrl, string apiHost, Guid unsubscribeToken)
{
    var title = WebUtility.HtmlEncode(post.Title);
    var excerpt = WebUtility.HtmlEncode(post.Excerpt);
    return $@"
        <h2>{title}</h2>
        <p>{excerpt}</p>
        <p><a href=""{postUrl}"">Read the full post</a></p>
        <p style=""font-size:12px;color:#888"">
            <a href=""{apiHost}/api/newsletter/unsubscribe/{unsubscribeToken}"">Unsubscribe</a>
        </p>";
}

    }
}
