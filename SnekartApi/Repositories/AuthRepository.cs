using Dapper;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public AuthRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_auth_emailexists(@Email)",
                new { Email = email.ToLower() });
        }

        // usp_customer_create ends with "RETURN new_id;" — Postgres's way of handing back an
        // identity column's generated value via RETURNING ... INTO. No OUTPUT parameter
        // needed: it's just a scalar SELECT like any other, so ExecuteScalarAsync fits.
        public async Task<Customer> CreateCustomerAsync(Customer customer)
        {
            using var conn = _connectionFactory.CreateConnection();

            customer.Id = await conn.ExecuteScalarAsync<int>(
                "SELECT usp_customer_create(@Name, @Email, @PasswordHash, @Level, @CreatedAt)",
                new
                {
                    customer.Name,
                    customer.Email,
                    customer.PasswordHash,
                    customer.Level,
                    customer.CreatedAt
                });

            return customer;
        }

        public async Task<Customer?> GetByEmailAsync(string email)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<Customer>(
                "SELECT * FROM usp_customer_getbyemail(@Email)",
                new { Email = email.ToLower() });
        }

        public async Task<Session> CreateSessionAsync(Session session)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "SELECT usp_session_create(@Token, @CustomerId, @ExpiresAt)",
                new
                {
                    session.Token,
                    session.CustomerId,
                    session.ExpiresAt
                });

            return session;
        }

        // Multi-mapping (splitting one joined row into Session + Customer) works the same way
        // regardless of database — it's a Dapper feature, not a SQL Server or Postgres one.
        // Still QueryAsync, not QueryFirstOrDefaultAsync, because multi-mapping needs the
        // (T1,T2,TReturn) overload.
        public async Task<Session?> GetSessionAsync(string token)
        {
            using var conn = _connectionFactory.CreateConnection();

            var sessions = await conn.QueryAsync<Session, Customer, Session>(
                "SELECT * FROM usp_session_getbytoken(@Token)",
                (session, customer) =>
                {
                    session.Customer = customer;
                    return session;
                },
                new { Token = token },
                splitOn: "Id");

            return sessions.FirstOrDefault();
        }

        public async Task DeleteSessionAsync(string token)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "SELECT usp_session_delete(@Token)",
                new { Token = token });
        }

        public async Task DeleteAllSessionsAsync(int customerId)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "SELECT usp_session_deleteall(@CustomerId)",
                new { CustomerId = customerId });
        }
    }
}
