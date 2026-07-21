using Microsoft.AspNetCore.Mvc;
using SnekartApi.DTOs;
using SnekartApi.Services;
using SnekartApi.Middleware;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/products/{slug}/reviews")]
    public class ReviewsController(IReviewService reviewService, IProductService productService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetReviews(string slug)
        {
            var product = await productService.GetProductBySlugAsync(slug);
            if (product == null) return NotFound();

            var reviews = await reviewService.GetReviewsForProductAsync(product.Id);
            return Ok(reviews);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReview(string slug, [FromBody] ReviewRequest req)
        {
            var product = await productService.GetProductBySlugAsync(slug);
            if (product == null) return NotFound();

            var result = await reviewService.CreateReviewAsync(product.Id, req);
            if (!result.Success) return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message, review = result.Review });
        }
[HttpDelete("{reviewId}")]
[RequireAdminSession]
public async Task<IActionResult> DeleteReview(string slug, int reviewId)
{
    var deleted = await reviewService.DeleteReviewAsync(reviewId);
    if (!deleted) return NotFound(new { message = "Review not found." });
    return Ok(new { message = "Review deleted." });
}

    }
}
