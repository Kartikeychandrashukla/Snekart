using Microsoft.AspNetCore.Mvc;
using SnekartApi.DTOs;
using SnekartApi.Middleware;
using SnekartApi.Services;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController(IProductService service) : ControllerBase
    {
        private readonly IProductService _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _service.GetAllProductsAsync();
            var isAdmin = HttpContext.Items["IsAdmin"] is true;
            if (isAdmin) return Ok(products);

            // CostPrice is internal margin data — never expose it to anonymous/customer requests
            var publicProducts = products.Select(p => new
            {
                p.Id, p.Tier, p.TierLabel, p.Name, p.Slug, p.Emotion,
                p.Price, p.Description, p.Items, p.Image, p.Badge, p.InStock,
            });
            return Ok(publicProducts);
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetProductBySlug(string slug)
        {
            var product = await _service.GetProductBySlugAsync(slug);
            if (product == null) return NotFound();

            var isAdmin = HttpContext.Items["IsAdmin"] is true;
            if (isAdmin) return Ok(product);

            // CostPrice is internal margin data — never expose it to anonymous/customer requests
            var publicProduct = new
            {
                product.Id, product.Tier, product.TierLabel, product.Name, product.Slug, product.Emotion,
                product.Price, product.Description, product.Items, product.Image, product.Images,
                product.Specifications, product.SellerName, product.SellerRating,
                product.Badge, product.InStock,
            };
            return Ok(publicProduct);
        }

        [HttpPost]
        [RequireAdminSession]
        public async Task<IActionResult> CreateProduct([FromBody] ProductRequest req)
        {
            var result = await _service.CreateProductAsync(req);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message, product = result.Product });
        }

        [HttpPut("{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductRequest req)
        {
            var result = await _service.UpdateProductAsync(id, req);
            if (result.NotFound) return NotFound(new { message = result.Message });
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpDelete("{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _service.DeleteProductAsync(id);
            if (result.NotFound) return NotFound(new { message = result.Message });
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }
    }
}
