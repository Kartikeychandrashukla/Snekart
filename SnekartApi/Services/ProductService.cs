using System.Text.RegularExpressions;
using SnekartApi.DTOs;
using SnekartApi.Models;
using SnekartApi.Repositories;

namespace SnekartApi.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;

        private static readonly Dictionary<int, string> TierLabels = new()
        {
            [1] = "Starter Kit",
            [2] = "Core Kit",
            [3] = "Premium Kit",
        };

        public ProductService(IProductRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Product>> GetAllProductsAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<Product?> GetProductBySlugAsync(string slug)
        {
            return await _repo.GetBySlugAsync(slug);
        }

        public async Task<ProductResult> CreateProductAsync(ProductRequest req)
        {
            try
            {
                var product = MapToProduct(req);
                await _repo.AddAsync(product);
                return new ProductResult { Success = true, Message = "Product added successfully.", Product = product };
            }
            catch (Exception)
            {
                return new ProductResult { Success = false, Message = "Failed to save product. Please try again." };
            }
        }

        public async Task<ProductResult> UpdateProductAsync(int id, ProductRequest req)
        {
            try
            {
                var product = MapToProduct(req);
                var updated = await _repo.UpdateAsync(id, product);
                if (!updated)
                    return new ProductResult { Success = false, NotFound = true, Message = "Product not found." };

                return new ProductResult { Success = true, Message = "Product updated successfully." };
            }
            catch (Exception)
            {
                return new ProductResult { Success = false, Message = "Failed to update product. Please try again." };
            }
        }

        public async Task<ProductResult> DeleteProductAsync(int id)
        {
            try
            {
                var deleted = await _repo.DeleteAsync(id);
                if (!deleted)
                    return new ProductResult { Success = false, NotFound = true, Message = "Product not found." };

                return new ProductResult { Success = true, Message = "Product deleted successfully." };
            }
            catch (Exception)
            {
                return new ProductResult { Success = false, Message = "Failed to delete product. Please try again." };
            }
        }

        private static Product MapToProduct(ProductRequest req)
        {
            return new Product
            {
                Tier        = req.Tier,
                TierLabel   = TierLabels.GetValueOrDefault(req.Tier, "Kit"),
                Name        = req.Name,
                Slug        = string.IsNullOrWhiteSpace(req.Slug) ? Slugify(req.Name) : Slugify(req.Slug),
                Emotion     = req.Emotion,
                Price       = req.Price,
                CostPrice   = req.CostPrice,
                Description = req.Description,
                Items       = req.Items,
                Image       = req.Image,
                Images      = req.Images,
                Specifications = req.Specifications,
                SellerName  = string.IsNullOrWhiteSpace(req.SellerName) ? "Snekart" : req.SellerName,
                SellerRating = req.SellerRating,
                Badge       = string.IsNullOrWhiteSpace(req.Badge) ? null : req.Badge,
                InStock     = req.InStock,
            };
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
