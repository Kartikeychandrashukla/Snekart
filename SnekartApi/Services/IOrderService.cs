using SnekartApi.DTOs;
using SnekartApi.Models;

namespace SnekartApi.Services
{
    public interface IOrderService
    {
        Task<OrderResult> PlaceOrderAsync(PlaceOrderRequest request, int? customerId);
        Task<Order?> GetOrderAsync(string id);
        Task<List<Order>> GetAllOrdersAsync();
        Task<OrderResult> UpdateStatusAsync(string id, string status);
        Task<List<Order>> GetMyOrdersAsync(int customerId);
        Task<OrderResult> VerifyPaymentAsync(string orderId, string razorpayPaymentId, string razorpaySignature);
        Task<bool> ConfirmPaymentFromWebhookAsync(string razorpayOrderId, string razorpayPaymentId);
    }

    public class OrderResult
    {
        public bool Success { get; set; }
        public bool NotFound { get; set; }
        public string Message { get; set; } = "";
        public Order? Order { get; set; }
        public string? RazorpayOrderId { get; set; }
        public string? RazorpayKeyId { get; set; }
    }
}
