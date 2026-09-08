using System.Data;
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
                "usp_Category_GetByType",
                new { Type = type },
                commandType: CommandType.StoredProcedure);

            return categories.ToList();
        }

        public async Task<Category> AddAsync(Category category)
        {
            using var conn = _connectionFactory.CreateConnection();

            category.Id = await conn.ExecuteScalarAsync<int>(
                "usp_Category_Add",
                new
                {
                    category.Type,
                    category.Name,
                    category.Slug,
                    category.CreatedAt
                },
                commandType: CommandType.StoredProcedure);

            return category;
        }

        // Only Name is updatable — Slug and Type are fixed at creation, since a product's
        // Emotion/Festival/Occasion tag lists reference a category by its Slug. Keeping Slug
        // immutable means renaming a category's display Name never breaks existing product tags.
        public async Task<bool> UpdateAsync(int id, string name)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_Category_Update",
                new { Id = id, Name = name },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<CategoryDeleteOutcome> DeleteAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            var result = await conn.ExecuteScalarAsync<int>(
                "usp_Category_Delete",
                new { Id = id },
                commandType: CommandType.StoredProcedure);

            return (CategoryDeleteOutcome)result;
        }
    }
}
