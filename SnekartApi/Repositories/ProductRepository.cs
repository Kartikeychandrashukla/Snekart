using System.Data;
using Dapper;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public ProductRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            using var conn = _connectionFactory.CreateConnection();

            var products = await conn.QueryAsync<Product>(
                "usp_Product_GetAll",
                commandType: CommandType.StoredProcedure);

            return products.ToList();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<Product>(
                "usp_Product_GetById",
                new { Id = id },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<Product?> GetBySlugAsync(string slug)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<Product>(
                "usp_Product_GetBySlug",
                new { Slug = slug },
                commandType: CommandType.StoredProcedure);
        }

        // `ids` goes through IntListTypeHandler the same as any other List<int> parameter —
        // it arrives at the SP as a JSON array string, unpacked server-side with OPENJSON
        // (SQL Server has no array parameter type, same reason the array columns are JSON).
        public async Task<List<Product>> GetByIdsAsync(List<int> ids)
        {
            using var conn = _connectionFactory.CreateConnection();

            var products = await conn.QueryAsync<Product>(
                "usp_Product_GetByIds",
                new { Ids = ids },
                commandType: CommandType.StoredProcedure);

            return products.ToList();
        }

        public async Task AddAsync(Product product)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "usp_Product_Add",
                new
                {
                    product.Tier,
                    product.TierLabel,
                    product.Name,
                    product.Slug,
                    product.Emotion,
                    product.Festival,
                    product.Occasion,
                    product.Price,
                    product.CostPrice,
                    product.Description,
                    product.Items,
                    product.Image,
                    product.Images,
                    product.Specifications,
                    product.SellerName,
                    product.SellerRating,
                    product.Badge,
                    product.InStock
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> UpdateAsync(int id, Product product)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_Product_Update",
                new
                {
                    Id = id,
                    product.Tier,
                    product.TierLabel,
                    product.Name,
                    product.Slug,
                    product.Emotion,
                    product.Festival,
                    product.Occasion,
                    product.Price,
                    product.CostPrice,
                    product.Description,
                    product.Items,
                    product.Image,
                    product.Images,
                    product.Specifications,
                    product.SellerName,
                    product.SellerRating,
                    product.Badge,
                    product.InStock
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_Product_Delete",
                new { Id = id },
                commandType: CommandType.StoredProcedure);
        }
    }
}
