using System.Data;
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
                "usp_Auth_EmailExists",
                new { Email = email.ToLower() },
                commandType: CommandType.StoredProcedure);
        }

        // usp_Customer_Create ends with "SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;" — SQL
        // Server's way of handing back an identity column's generated value. No OUTPUT
        // parameter needed: it's just a scalar SELECT like any other, so ExecuteScalarAsync fits.
        public async Task<Customer> CreateCustomerAsync(Customer customer)
        {
            using var conn = _connectionFactory.CreateConnection();

            customer.Id = await conn.ExecuteScalarAsync<int>(
                "usp_Customer_Create",
                new
                {
                    customer.Name,
                    customer.Email,
                    customer.PasswordHash,
                    customer.Level,
                    customer.CreatedAt
                },
                commandType: CommandType.StoredProcedure);

            return customer;
        }

        public async Task<Customer?> GetByEmailAsync(string email)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<Customer>(
                "usp_Customer_GetByEmail",
                new { Email = email.ToLower() },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<Session> CreateSessionAsync(Session session)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "usp_Session_Create",
                new
                {
                    session.Token,
                    session.CustomerId,
                    session.ExpiresAt
                },
                commandType: CommandType.StoredProcedure);

            return session;
        }

        // Multi-mapping (splitting one joined row into Session + Customer) works the same way
        // regardless of database — it's a Dapper feature, not a Postgres one. Still QueryAsync,
        // not QueryFirstOrDefaultAsync, because multi-mapping needs the (T1,T2,TReturn) overload.
        public async Task<Session?> GetSessionAsync(string token)
        {
            using var conn = _connectionFactory.CreateConnection();

            var sessions = await conn.QueryAsync<Session, Customer, Session>(
                "usp_Session_GetByToken",
                (session, customer) =>
                {
                    session.Customer = customer;
                    return session;
                },
                new { Token = token },
                splitOn: "Id",
                commandType: CommandType.StoredProcedure);

            return sessions.FirstOrDefault();
        }

        public async Task DeleteSessionAsync(string token)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "usp_Session_Delete",
                new { Token = token },
                commandType: CommandType.StoredProcedure);
        }

        public async Task DeleteAllSessionsAsync(int customerId)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "usp_Session_DeleteAll",
                new { CustomerId = customerId },
                commandType: CommandType.StoredProcedure);
        }

        // --- PRACTICE ---
        // Write usp_Auth_CountCustomersByLevel(@Level NVARCHAR(50)) returning a single int, and
        // a matching Task<int> CountCustomersByLevelAsync(string level) here via ExecuteScalarAsync<int>.
    }
}
