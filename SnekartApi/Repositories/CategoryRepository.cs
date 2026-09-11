using Dapper;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public CategoryRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<List<Category>> GetByTypeAsync(string type)
        {
            using var conn = _connectionFactory.CreateConnection();

            var categories = await conn.QueryAsync<Category>(
                "SELECT * FROM usp_category_getbytype(@Type)",
                new { Type = type });

            return categories.ToList();
        }

        public async Task<Category> AddAsync(Category category)
        {
            using var conn = _connectionFactory.CreateConnection();

            category.Id = await conn.ExecuteScalarAsync<int>(
                "SELECT usp_category_add(@Type, @Name, @Slug, @CreatedAt)",
                new
                {
                    category.Type,
                    category.Name,
                    category.Slug,
                    category.CreatedAt
                });

            return category;
        }

        // Only Name is updatable — Slug and Type are fixed at creation, since a product's
        // Emotion/Festival/Occasion tag lists reference a category by its Slug. Keeping Slug
        // immutable means renaming a category's display Name never breaks existing product tags.
        public async Task<bool> UpdateAsync(int id, string name)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_category_update(@Id, @Name)",
                new { Id = id, Name = name });
        }

        public async Task<CategoryDeleteOutcome> DeleteAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            var result = await conn.ExecuteScalarAsync<int>(
                "SELECT usp_category_delete(@Id)",
                new { Id = id });

            return (CategoryDeleteOutcome)result;
        }
    }
}
