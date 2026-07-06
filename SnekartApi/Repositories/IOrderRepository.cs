using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public interface IOrderRepository
    {
        Task AddAsync(Order order);
        Task<Order?> GetByIdAsync(string id);
        Task<List<Order>> GetAllAsync();
        Task<bool> UpdateStatusAsync(string id, string status);

        Task<List<Order>> GetMyOrdersAsync(int customerId);
    }
}