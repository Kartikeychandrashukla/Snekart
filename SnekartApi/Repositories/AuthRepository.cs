using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly SnekartDbContext _db;

        public AuthRepository(SnekartDbContext db)
        {
            _db = db;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _db.Customers.AnyAsync(c => c.Email == email.ToLower());
        }

        public async Task<Customer> CreateCustomerAsync(Customer customer)
        {
            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();
            return customer;
        }

        public async Task<Customer?> GetByEmailAsync(string email)
        {
            return await _db.Customers
                .FirstOrDefaultAsync(c => c.Email == email.ToLower());
        }

        public async Task<Session> CreateSessionAsync(Session session)
        {
            _db.Sessions.Add(session);
            await _db.SaveChangesAsync();
            return session;
        }

        public async Task<Session?> GetSessionAsync(string token)
        {
            return await _db.Sessions
                .Include(s => s.Customer)
                .FirstOrDefaultAsync(s => s.Token == token && s.ExpiresAt > DateTime.UtcNow);
        }

        public async Task DeleteSessionAsync(string token)
        {
            var session = await _db.Sessions.FindAsync(token);
            if (session != null)
            {
                _db.Sessions.Remove(session);
                await _db.SaveChangesAsync();
            }
        }

        public async Task DeleteAllSessionsAsync(int customerId)
        {
            var sessions = await _db.Sessions
                .Where(s => s.CustomerId == customerId)
                .ToListAsync();
            _db.Sessions.RemoveRange(sessions);
            await _db.SaveChangesAsync();
        }
    }
}
