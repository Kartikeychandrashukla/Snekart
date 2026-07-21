using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public interface IBlogPostRepository
    {
        Task<List<BlogPost>> GetAllAsync();
        Task<BlogPost?> GetByIdAsync(int id);
        Task<BlogPost?> GetBySlugAsync(string slug);
        Task AddAsync(BlogPost post);
        Task<bool> UpdateAsync(int id, BlogPost post);
        Task<bool> DeleteAsync(int id);
    }
}
