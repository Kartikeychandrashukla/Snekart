using System.Security.Cryptography;
using SnekartApi.Models;
using SnekartApi.Repositories;

namespace SnekartApi.Services
{
    public class AuthService(IAuthRepository repo) : IAuthService
    {
        private readonly IAuthRepository _repo = repo;

        public async Task<AuthResult> RegisterAsync(string name, string email, string password)
        {
            try
            {
                if (await _repo.EmailExistsAsync(email))
                    return new AuthResult { Success = false, Message = "Email already registered." };

                var customer = new Customer
                {
                    Name         = name.Trim(),
                    Email        = email.Trim().ToLower(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    CreatedAt    = DateTime.UtcNow,
                };

                await _repo.CreateCustomerAsync(customer);

                var session = await CreateSession(customer.Id);
                return new AuthResult
                {
                    Success      = true,
                    Message      = "Account created successfully.",
                    Token        = session.Token,
                    CustomerName = customer.Name,
                    CustomerId   = customer.Id,
                    Level        = customer.Level,
                };
            }
            catch (Exception)
            {
                return new AuthResult { Success = false, Message = "Something went wrong. Please try again." };
            }
        }

        public async Task<AuthResult> LoginAsync(string email, string password)
        {
            try
            {
                var customer = await _repo.GetByEmailAsync(email);

                if (customer == null || !BCrypt.Net.BCrypt.Verify(password, customer.PasswordHash))
                    return new AuthResult { Success = false, Message = "Invalid email or password." };

                // Invalidate all existing sessions — enforces single active session per customer
                await _repo.DeleteAllSessionsAsync(customer.Id);

                var session = await CreateSession(customer.Id);
                return new AuthResult
                {
                    Success      = true,
                    Message      = "Login successful.",
                    Token        = session.Token,
                    CustomerName = customer.Name,
                    CustomerId   = customer.Id,
                    Level        = customer.Level,
                };
            }
            catch (Exception)
            {
                return new AuthResult { Success = false, Message = "Something went wrong. Please try again." };
            }
        }

        public async Task LogoutAsync(string token)
        {
            try
            {
                await _repo.DeleteSessionAsync(token);
            }
            catch (Exception)
            {
                // Best-effort — the cookie is cleared client-side regardless of whether
                // the DB delete succeeds, so a failure here shouldn't block logout.
            }
        }

        private async Task<Session> CreateSession(int customerId)
        {
            var session = new Session
            {
                Token      = GenerateSessionToken(),
                CustomerId = customerId,
                ExpiresAt  = DateTime.UtcNow.AddDays(1),
            };
            return await _repo.CreateSessionAsync(session);
        }

        // 256 bits from the OS CSPRNG — Guid.NewGuid() happens to be random on
        // current .NET runtimes, but that's an implementation detail, not a
        // documented guarantee; RandomNumberGenerator is the actual contract
        // for "this is safe to use as a security credential"
        private static string GenerateSessionToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        }
    }
}
