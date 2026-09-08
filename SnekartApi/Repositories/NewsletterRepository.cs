using System.Data;
using Dapper;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    // SQL Server has no PROCEDURE/FUNCTION split like Postgres — every operation here is a
    // plain stored procedure (usp_*), called with CommandType.StoredProcedure. Which Dapper
    // method to call depends only on what the SP's SELECT (if any) hands back: QueryAsync<T>
    // for multiple rows, QueryFirstOrDefaultAsync<T> for one row, ExecuteScalarAsync<T> for a
    // single value, ExecuteAsync for nothing (just rows-affected).
    public class NewsletterRepository : INewsletterRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public NewsletterRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_Newsletter_ExistsByEmail",
                new { Email = email },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<NewsletterSubscriber?> GetByTokenAsync(Guid token)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<NewsletterSubscriber>(
                "usp_Newsletter_GetByToken",
                new { Token = token },
                commandType: CommandType.StoredProcedure);
        }

        public async Task AddAsync(NewsletterSubscriber subscriber)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "usp_Newsletter_Add",
                new
                {
                    subscriber.Email,
                    subscriber.SubscribedAt,
                    subscriber.UnsubscribeToken
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<List<NewsletterSubscriber>> GetAllSubscribersAsync()
        {
            using var conn = _connectionFactory.CreateConnection();

            var subscribers = await conn.QueryAsync<NewsletterSubscriber>(
                "usp_Newsletter_GetAll",
                commandType: CommandType.StoredProcedure);

            return subscribers.ToList();
        }

        public async Task<bool> DeleteAsync(NewsletterSubscriber subscriber)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_Newsletter_Delete",
                new { subscriber.Id },
                commandType: CommandType.StoredProcedure);
        }

        // --- PRACTICE ---
        // Write usp_Newsletter_Count returning a single int (SELECT COUNT(*) ...), and a
        // matching Task<int> CountSubscribersAsync() here via ExecuteScalarAsync<int>.
    }
}
