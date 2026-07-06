using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public interface IAuthRepository
    {
        Task<bool> EmailExistsAsync(string email);
        Task<Customer> CreateCustomerAsync(Customer customer);
        Task<Customer?> GetByEmailAsync(string email);
        Task<Session> CreateSessionAsync(Session session);
        Task<Session?> GetSessionAsync(string token);
        Task DeleteSessionAsync(string token);
        Task DeleteAllSessionsAsync(int customerId);
    }
}
