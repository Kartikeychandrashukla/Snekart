using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public interface IReviewRepository
    {
        Task<List<Review>> GetByProductIdAsync(int productId);
        Task AddAsync(Review review);
        Task<bool> DeleteAsync(int id);

    }
}
