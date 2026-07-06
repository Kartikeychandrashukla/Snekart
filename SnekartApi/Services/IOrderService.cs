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
    }

    public class OrderResult
    {
        public bool Success { get; set; }
        public bool NotFound { get; set; }
        public string Message { get; set; } = "";
        public Order? Order { get; set; }
    }
}
