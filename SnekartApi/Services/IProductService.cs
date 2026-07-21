using SnekartApi.DTOs;
using SnekartApi.Models;

namespace SnekartApi.Services
{
    public interface IProductService
    {
        Task<List<Product>> GetAllProductsAsync();
        Task<Product?> GetProductBySlugAsync(string slug);
        Task<ProductResult> CreateProductAsync(ProductRequest req);
        Task<ProductResult> UpdateProductAsync(int id, ProductRequest req);
        Task<ProductResult> DeleteProductAsync(int id);
    }

    public class ProductResult
    {
        public bool Success { get; set; }
        public bool NotFound { get; set; }
        public string Message { get; set; } = "";
        public Product? Product { get; set; }
    }
}
