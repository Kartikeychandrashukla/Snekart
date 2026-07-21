using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using SnekartApi.Services;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/webhooks")]
    public class WebhooksController(IPaymentService paymentService, IOrderService orderService, ILogger<WebhooksController> logger) : ControllerBase
    {
        private readonly IPaymentService _paymentService = paymentService;
        private readonly IOrderService _orderService = orderService;
        private readonly ILogger<WebhooksController> _logger = logger;

        [HttpPost("razorpay")]
        public async Task<IActionResult> Razorpay()
        {
            Request.EnableBuffering();
            using var reader = new StreamReader(Request.Body, leaveOpen: true);
            var rawBody = await reader.ReadToEndAsync();
            Request.Body.Position = 0;

            var signature = Request.Headers["X-Razorpay-Signature"].ToString();
            if (!_paymentService.VerifyWebhookSignature(rawBody, signature))
            {
                _logger.LogWarning("Razorpay webhook signature verification failed");
                return Unauthorized();
            }

            try
            {
                using var doc = JsonDocument.Parse(rawBody);
                var eventType = doc.RootElement.GetProperty("event").GetString();
                if (eventType == "payment.captured" || eventType == "order.paid")
                {
                    var payment = doc.RootElement
                        .GetProperty("payload").GetProperty("payment").GetProperty("entity");
                    var razorpayOrderId = payment.GetProperty("order_id").GetString();
                    var razorpayPaymentId = payment.GetProperty("id").GetString();

                    if (!string.IsNullOrEmpty(razorpayOrderId) && !string.IsNullOrEmpty(razorpayPaymentId))
                        await _orderService.ConfirmPaymentFromWebhookAsync(razorpayOrderId, razorpayPaymentId);
                }
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Failed to parse Razorpay webhook payload");
            }

            return Ok();
        }
    }
}
