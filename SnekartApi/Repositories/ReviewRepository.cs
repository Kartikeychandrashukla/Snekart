using System.Data;
using Dapper;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public ReviewRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<List<Review>> GetByProductIdAsync(int productId)
        {
            using var conn = _connectionFactory.CreateConnection();

            var reviews = await conn.QueryAsync<Review>(
                "usp_Review_GetByProduct",
                new { ProductId = productId },
                commandType: CommandType.StoredProcedure);

            return reviews.ToList();
        }

        // Review.Images (List<string>) round-trips through StringListTypeHandler as a JSON
        // array string — Dapper serializes it automatically before it reaches this parameter.
        public async Task AddAsync(Review review)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "usp_Review_Add",
                new
                {
                    review.ProductId,
                    review.CustomerName,
                    review.Rating,
                    review.Comment,
                    review.Images,
                    review.CreatedAt
                },
                commandType: CommandType.StoredProcedure);
        }

        // usp_Review_Delete does the existence check, ProductImages cleanup (via OPENJSON over
        // the Images column), and the Reviews delete in one round trip, then
        // SELECT CASE WHEN @@ROWCOUNT > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;
        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_Review_Delete",
                new { Id = id },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<decimal?> GetAverageRatingAsync(int productId)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<decimal?>(
                "usp_Review_GetAverageRating",
                new { ProductId = productId },
                commandType: CommandType.StoredProcedure);
        }
    }
}
