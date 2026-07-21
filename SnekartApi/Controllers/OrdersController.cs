using Microsoft.AspNetCore.Mvc;
using SnekartApi.DTOs;
using SnekartApi.Middleware;
using SnekartApi.Services;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController(IOrderService service) : ControllerBase
    {
        private readonly IOrderService _service = service;

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest req)
        {
            // Attach customer if logged in (middleware sets this; null for guests)
            var customerId = HttpContext.Items["CustomerId"] as int?;
            var result = await _service.PlaceOrderAsync(req, customerId);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new
            {
                result.Order!.Id,
                result.Order.PlacedAt,
                result.Order.Total,
                message = result.Message,
                razorpayOrderId = result.RazorpayOrderId,
                razorpayKeyId = result.RazorpayKeyId,
            });
        }

        [HttpPost("{id}/verify-payment")]
        public async Task<IActionResult> VerifyPayment(string id, [FromBody] VerifyPaymentRequest req)
        {
            var result = await _service.VerifyPaymentAsync(id, req.RazorpayPaymentId, req.RazorpaySignature);
            if (result.NotFound) return NotFound(new { message = result.Message });
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { result.Order!.Id, status = result.Order.PaymentStatus, message = result.Message });
        }

        [HttpGet]
        [RequireAdminSession]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _service.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(string id)
        {
            var order = await _service.GetOrderAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpPatch("{id}/status")]
        [RequireAdminSession]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusRequest req)
        {
            var result = await _service.UpdateStatusAsync(id, req.Status);
            if (result.NotFound) return NotFound(new { message = result.Message });
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { id, status = req.Status, message = result.Message });
        }

        // Requires a valid session token — middleware resolves it, [RequireSession] blocks if absent
        [HttpGet("my")]
        [RequireSession]
        public async Task<IActionResult> GetMyOrders()
        {
            var customerId = (int)HttpContext.Items["CustomerId"]!;
            var orders = await _service.GetMyOrdersAsync(customerId);
            return Ok(orders);
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = "";
    }
}
