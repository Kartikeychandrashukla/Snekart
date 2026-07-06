using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(int id);
        Task<List<Product>> GetByIdsAsync(List<int> ids);
        Task AddAsync(Product product);
        Task<bool> UpdateAsync(int id, Product product);
        Task<bool> DeleteAsync(int id);
    }
}
