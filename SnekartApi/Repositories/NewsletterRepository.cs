using Dapper;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    // Every operation here goes through a Postgres function (usp_*), called as plain SQL text
    // ("SELECT usp_x(...)" for a scalar/void result, "SELECT * FROM usp_x(...)" for rows).
    // Which Dapper method to call depends only on what the function hands back: QueryAsync<T>
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
                "SELECT usp_newsletter_existsbyemail(@Email)",
                new { Email = email });
        }

        public async Task<NewsletterSubscriber?> GetByTokenAsync(Guid token)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<NewsletterSubscriber>(
                "SELECT * FROM usp_newsletter_getbytoken(@Token)",
                new { Token = token });
        }

        public async Task AddAsync(NewsletterSubscriber subscriber)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "SELECT usp_newsletter_add(@Email, @SubscribedAt, @UnsubscribeToken)",
                new
                {
                    subscriber.Email,
                    subscriber.SubscribedAt,
                    subscriber.UnsubscribeToken
                });
        }

        public async Task<List<NewsletterSubscriber>> GetAllSubscribersAsync()
        {
            using var conn = _connectionFactory.CreateConnection();

            var subscribers = await conn.QueryAsync<NewsletterSubscriber>("SELECT * FROM usp_newsletter_getall()");

            return subscribers.ToList();
        }

        public async Task<bool> DeleteAsync(NewsletterSubscriber subscriber)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_newsletter_delete(@Id)",
                new { subscriber.Id });
        }
    }
}
