using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Models;


namespace SnekartApi.Repositories
{
    public class ReviewRepository: IReviewRepository
    {
        private readonly SnekartDbContext _db;
        public ReviewRepository(SnekartDbContext db)
        {
            _db=db;
        }

        public async Task<List<Review>> GetByProductIdAsync(int productId)
        {
             return await _db.Reviews
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async  Task AddAsync(Review review)
        {
            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int id)
{
    var existing = await _db.Reviews.FindAsync(id);
    if (existing == null) return false;

    if (existing.Images.Count > 0)
    {
        var imageIds = existing.Images
            .Select(url => Guid.TryParse(url.Split('/').Last(), out var g) ? g : (Guid?)null)
            .Where(g => g.HasValue)
            .Select(g => g!.Value)
            .ToList();

        var images = await _db.ProductImages.Where(img => imageIds.Contains(img.Id)).ToListAsync();
        _db.ProductImages.RemoveRange(images);
    }

    _db.Reviews.Remove(existing);
    await _db.SaveChangesAsync();
    return true;
}

    }
}