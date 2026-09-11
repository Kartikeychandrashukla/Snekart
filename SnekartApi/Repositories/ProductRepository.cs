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

            var products = await conn.QueryAsync<Product>("SELECT * FROM usp_product_getall()");

            return products.ToList();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<Product>(
                "SELECT * FROM usp_product_getbyid(@Id)",
                new { Id = id });
        }

        public async Task<Product?> GetBySlugAsync(string slug)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<Product>(
                "SELECT * FROM usp_product_getbyslug(@Slug)",
                new { Slug = slug });
        }

        // `ids` is passed as a plain int[] (not List<int>) specifically to bypass the
        // globally-registered IntListTypeHandler, which would otherwise serialize it to a
        // JSON string the way it does for List<int> model columns. Npgsql maps int[]
        // straight onto Postgres's native integer[] parameter type instead.
        public async Task<List<Product>> GetByIdsAsync(List<int> ids)
        {
            using var conn = _connectionFactory.CreateConnection();

            var products = await conn.QueryAsync<Product>(
                "SELECT * FROM usp_product_getbyids(@Ids)",
                new { Ids = ids.ToArray() });

            return products.ToList();
        }

        public async Task AddAsync(Product product)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "SELECT usp_product_add(@Tier, @TierLabel, @Name, @Slug, @Emotion, @Festival, @Occasion, @Price, @CostPrice, @Description, @Items, @Image, @Images, @Specifications, @SellerName, @SellerRating, @Badge, @InStock)",
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
                });
        }

        public async Task<bool> UpdateAsync(int id, Product product)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_product_update(@Id, @Tier, @TierLabel, @Name, @Slug, @Emotion, @Festival, @Occasion, @Price, @CostPrice, @Description, @Items, @Image, @Images, @Specifications, @SellerName, @SellerRating, @Badge, @InStock)",
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
                });
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_product_delete(@Id)",
                new { Id = id });
        }
    }
}
