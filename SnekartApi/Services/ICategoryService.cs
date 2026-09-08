using SnekartApi.DTOs;
using SnekartApi.Models;

namespace SnekartApi.Services
{
    public interface ICategoryService
    {
        Task<List<Category>> GetByTypeAsync(string type);
        Task<CategoryResult> CreateAsync(CategoryRequest req);
        Task<CategoryResult> UpdateAsync(int id, CategoryRequest req);
        Task<CategoryResult> DeleteAsync(int id);
    }

    public class CategoryResult
    {
        public bool Success { get; set; }
        public bool NotFound { get; set; }
        public string Message { get; set; } = "";
        public Category? Category { get; set; }
    }
}
