using System.Text.RegularExpressions;
using SnekartApi.DTOs;
using SnekartApi.Models;
using SnekartApi.Repositories;

namespace SnekartApi.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;

        private static readonly HashSet<string> ValidTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "Emotion", "Festival", "Occasion",
        };

        public CategoryService(ICategoryRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Category>> GetByTypeAsync(string type)
        {
            if (!ValidTypes.Contains(type)) return new List<Category>();
            return await _repo.GetByTypeAsync(type);
        }

        public async Task<CategoryResult> CreateAsync(CategoryRequest req)
        {
            if (!ValidTypes.Contains(req.Type))
                return new CategoryResult { Success = false, Message = "Type must be Emotion, Festival, or Occasion." };

            if (string.IsNullOrWhiteSpace(req.Name))
                return new CategoryResult { Success = false, Message = "Name is required." };

            try
            {
                var category = new Category
                {
                    Type      = req.Type,
                    Name      = req.Name.Trim(),
                    Slug      = Slugify(req.Name),
                    CreatedAt = DateTime.UtcNow,
                };

                await _repo.AddAsync(category);
                return new CategoryResult { Success = true, Message = "Category added successfully.", Category = category };
            }
            catch (Exception)
            {
                return new CategoryResult { Success = false, Message = "Failed to save category. Please try again." };
            }
        }

        public async Task<CategoryResult> UpdateAsync(int id, CategoryRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return new CategoryResult { Success = false, Message = "Name is required." };

            try
            {
                var updated = await _repo.UpdateAsync(id, req.Name.Trim());
                if (!updated)
                    return new CategoryResult { Success = false, NotFound = true, Message = "Category not found." };

                return new CategoryResult { Success = true, Message = "Category updated successfully." };
            }
            catch (Exception)
            {
                return new CategoryResult { Success = false, Message = "Failed to update category. Please try again." };
            }
        }

        public async Task<CategoryResult> DeleteAsync(int id)
        {
            try
            {
                var outcome = await _repo.DeleteAsync(id);

                return outcome switch
                {
                    CategoryDeleteOutcome.NotFound => new CategoryResult { Success = false, NotFound = true, Message = "Category not found." },
                    CategoryDeleteOutcome.InUse => new CategoryResult { Success = false, Message = "This category is still assigned to one or more products — remove it from those products first." },
                    _ => new CategoryResult { Success = true, Message = "Category deleted successfully." },
                };
            }
            catch (Exception)
            {
                return new CategoryResult { Success = false, Message = "Failed to delete category. Please try again." };
            }
        }

        private static string Slugify(string value)
        {
            var slug = value.Trim().ToLowerInvariant();
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"[\s-]+", "-").Trim('-');
            return slug;
        }
    }
}
