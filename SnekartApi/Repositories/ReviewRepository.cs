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
                "SELECT * FROM usp_review_getbyproduct(@ProductId)",
                new { ProductId = productId });

            return reviews.ToList();
        }

        // Review.Images (List<string>) round-trips through StringListTypeHandler as a JSON
        // array string — Dapper serializes it automatically before it reaches this parameter.
        public async Task AddAsync(Review review)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "SELECT usp_review_add(@ProductId, @CustomerName, @Rating, @Comment, @Images, @CreatedAt)",
                new
                {
                    review.ProductId,
                    review.CustomerName,
                    review.Rating,
                    review.Comment,
                    review.Images,
                    review.CreatedAt
                });
        }

        // usp_review_delete does the existence check, productimages cleanup (parsing the
        // guid out of each URL in the Images column), and the reviews delete in one round trip.
        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_review_delete(@Id)",
                new { Id = id });
        }

        public async Task<decimal?> GetAverageRatingAsync(int productId)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<decimal?>(
                "SELECT usp_review_getaveragerating(@ProductId)",
                new { ProductId = productId });
        }
    }
}
