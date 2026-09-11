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

            var posts = await conn.QueryAsync<BlogPost>("SELECT * FROM usp_blogpost_getall()");

            return posts.ToList();
        }

        public async Task<BlogPost?> GetByIdAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<BlogPost>(
                "SELECT * FROM usp_blogpost_getbyid(@Id)",
                new { Id = id });
        }

        public async Task<BlogPost?> GetBySlugAsync(string slug)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.QueryFirstOrDefaultAsync<BlogPost>(
                "SELECT * FROM usp_blogpost_getbyslug(@Slug)",
                new { Slug = slug });
        }

        public async Task AddAsync(BlogPost post)
        {
            using var conn = _connectionFactory.CreateConnection();

            await conn.ExecuteAsync(
                "SELECT usp_blogpost_add(@Title, @Slug, @Category, @Emotion, @Excerpt, @Content, @Author, @ReadTime, @Image, @Video, @PublishedAt, @RelatedProductIds)",
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
                });
        }

        // PublishedAt is excluded here on purpose — same rule as before, an edit never touches
        // when the post first went live.
        public async Task<bool> UpdateAsync(int id, BlogPost post)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_blogpost_update(@Id, @Title, @Slug, @Category, @Emotion, @Excerpt, @Content, @Author, @ReadTime, @Image, @Video, @RelatedProductIds)",
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
                });
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var conn = _connectionFactory.CreateConnection();

            return await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_blogpost_delete(@Id)",
                new { Id = id });
        }
    }
}
