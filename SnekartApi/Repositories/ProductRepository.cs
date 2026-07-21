using Microsoft.EntityFrameworkCore;
using SnekartApi.Data;
using SnekartApi.Models;

namespace SnekartApi.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly SnekartDbContext _db;

        public ProductRepository(SnekartDbContext db)
        {
            _db = db;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _db.Products
                .OrderBy(p => p.Tier)
                .ThenBy(p => p.Id)
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _db.Products.FindAsync(id);
        }

        public async Task<Product?> GetBySlugAsync(string slug)
        {
            return await _db.Products.FirstOrDefaultAsync(p => p.Slug == slug);
        }

        public async Task<List<Product>> GetByIdsAsync(List<int> ids)
        {
            return await _db.Products.Where(p => ids.Contains(p.Id)).ToListAsync();
        }

        public async Task AddAsync(Product product)
        {
            _db.Products.Add(product);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> UpdateAsync(int id, Product product)
        {
            var existing = await _db.Products.FindAsync(id);
            if (existing == null) return false;

            existing.Tier        = product.Tier;
            existing.TierLabel   = product.TierLabel;
            existing.Name        = product.Name;
            existing.Slug        = product.Slug;
            existing.Emotion     = product.Emotion;
            existing.Price       = product.Price;
            existing.CostPrice   = product.CostPrice;
            existing.Description = product.Description;
            existing.Items       = product.Items;
            existing.Image       = product.Image;
            existing.Images      = product.Images;
            existing.Specifications = product.Specifications;
            existing.SellerName  = product.SellerName;
            existing.SellerRating = product.SellerRating;
            existing.Badge       = product.Badge;
            existing.InStock     = product.InStock;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Products.FindAsync(id);
            if (existing == null) return false;

            _db.Products.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
