using System.Data;
using Dapper;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class BlogPostRepository : IBlogPostRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public BlogPostRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<List<BlogPost>> GetAllAsync()
        {
            using var conn = _connectionFactory.CreateConnection();

            var posts = await conn.QueryAsync<BlogPost>(
                "usp_BlogPost_GetAll",
                commandType: CommandType.StoredProcedure);

            return posts.ToList();
        }

        public async Task<BlogPost?> GetByIdAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<BlogPost>(
                "usp_BlogPost_GetById",
                new { Id = id },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<BlogPost?> GetBySlugAsync(string slug)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<BlogPost>(
                "usp_BlogPost_GetBySlug",
                new { Slug = slug },
                commandType: CommandType.StoredProcedure);
        }

        public async Task AddAsync(BlogPost post)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "usp_BlogPost_Add",
                new
                {
                    post.Title,
                    post.Slug,
                    post.Category,
                    post.Emotion,
                    post.Excerpt,
                    post.Content,
                    post.Author,
                    post.ReadTime,
                    post.Image,
                    post.Video,
                    post.PublishedAt,
                    post.RelatedProductIds
                },
                commandType: CommandType.StoredProcedure);
        }

        // PublishedAt is excluded here on purpose — same rule as before, an edit never touches
        // when the post first went live.
        public async Task<bool> UpdateAsync(int id, BlogPost post)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_BlogPost_Update",
                new
                {
                    Id = id,
                    post.Title,
                    post.Slug,
                    post.Category,
                    post.Emotion,
                    post.Excerpt,
                    post.Content,
                    post.Author,
                    post.ReadTime,
                    post.Image,
                    post.Video,
                    post.RelatedProductIds
                },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "usp_BlogPost_Delete",
                new { Id = id },
                commandType: CommandType.StoredProcedure);
        }
    }
}
