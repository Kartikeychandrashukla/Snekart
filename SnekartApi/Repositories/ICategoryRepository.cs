using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public enum CategoryDeleteOutcome
    {
        NotFound,
        Deleted,
        InUse,
    }

    public interface ICategoryRepository
    {
        Task<List<Category>> GetByTypeAsync(string type);
        Task<Category> AddAsync(Category category);
        Task<bool> UpdateAsync(int id, string name);
        Task<bool> UpdateContentAsync(int id, CategoryContent? content);
        Task<CategoryDeleteOutcome> DeleteAsync(int id);
    }
}
