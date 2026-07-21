using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SnekartApi.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(HttpClient http, IConfiguration config, ILogger<PaymentService> logger)
        {
            _http = http;
            _config = config;
            _logger = logger;
        }

        public string? KeyId => _config["RazorpayKeyId"];

        public async Task<string> CreateOrderAsync(decimal amount, string receipt)
        {
            var keyId = _config["RazorpayKeyId"];
            var keySecret = _config["RazorpayKeySecret"];
            if (string.IsNullOrWhiteSpace(keyId) || string.IsNullOrWhiteSpace(keySecret))
                throw new InvalidOperationException("Razorpay is not configured.");

            using var request = new HttpRequestMessage(HttpMethod.Post, "orders")
            {
                Content = JsonContent.Create(new
                {
                    amount = (long)Math.Round(amount * 100), // paise
                    currency = "INR",
                    receipt,
                }),
            };
            request.Headers.Authorization = new AuthenticationHeaderValue(
                "Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes($"{keyId}:{keySecret}")));

            var response = await _http.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Razorpay order creation failed {StatusCode}: {Body}", response.StatusCode, body);
                throw new InvalidOperationException("Failed to create Razorpay order.");
            }

            using var doc = JsonDocument.Parse(body);
            return doc.RootElement.GetProperty("id").GetString()
                ?? throw new InvalidOperationException("Razorpay order response missing id.");
        }

        public bool VerifyPaymentSignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature)
        {
            var keySecret = _config["RazorpayKeySecret"];
            if (string.IsNullOrWhiteSpace(keySecret) || string.IsNullOrWhiteSpace(razorpaySignature))
                return false;

            var expected = ComputeHmacHex($"{razorpayOrderId}|{razorpayPaymentId}", keySecret);
            return FixedTimeEquals(expected, razorpaySignature);
        }

        public bool VerifyWebhookSignature(string rawBody, string signatureHeader)
        {
            var webhookSecret = _config["RazorpayWebhookSecret"];
            if (string.IsNullOrWhiteSpace(webhookSecret) || string.IsNullOrWhiteSpace(signatureHeader))
                return false;

            var expected = ComputeHmacHex(rawBody, webhookSecret);
            return FixedTimeEquals(expected, signatureHeader);
        }

        private static string ComputeHmacHex(string payload, string secret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        private static bool FixedTimeEquals(string expectedHex, string actualHex)
        {
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expectedHex), Encoding.UTF8.GetBytes(actualHex));
        }
    }
}
