using SnekartApi.DTOs;
using SnekartApi.Models;

namespace SnekartApi.Services
{
    public interface IBlogPostService
    {
        Task<List<BlogPost>> GetAllPostsAsync();
        Task<BlogPost?> GetPostBySlugAsync(string slug);
        Task<BlogPostResult> CreatePostAsync(BlogPostRequest req);
        Task<BlogPostResult> UpdatePostAsync(int id, BlogPostRequest req);
        Task<BlogPostResult> DeletePostAsync(int id);
    }

    public class BlogPostResult
    {
        public bool Success { get; set; }
        public bool NotFound { get; set; }
        public string Message { get; set; } = "";
        public BlogPost? Post { get; set; }
    }
}
