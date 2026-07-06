using Microsoft.AspNetCore.Mvc;
using SnekartApi.Data;
using SnekartApi.Middleware;
using SnekartApi.Models;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController(SnekartDbContext db) : ControllerBase
    {
        private readonly SnekartDbContext _db = db;
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        private static readonly Dictionary<string, string> ContentTypes = new()
        {
            [".jpg"] = "image/jpeg", [".jpeg"] = "image/jpeg",
            [".png"] = "image/png", [".webp"] = "image/webp", [".gif"] = "image/gif",
        };

        [HttpPost("image")]
        [RequestSizeLimit(10_000_000)]
        [RequireAdminSession]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                return BadRequest(new { message = "Unsupported file type. Use jpg, png, webp or gif." });

            try
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);

                var image = new ProductImage
                {
                    Id          = Guid.NewGuid(),
                    Data        = ms.ToArray(),
                    ContentType = ContentTypes[ext],
                };

                _db.ProductImages.Add(image);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Image uploaded successfully.", url = $"/api/uploads/image/{image.Id}" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Failed to upload image. Please try again." });
            }
        }

        [HttpGet("image/{id}")]
        public async Task<IActionResult> GetImage(Guid id)
        {
            var image = await _db.ProductImages.FindAsync(id);
            if (image == null) return NotFound();
            return File(image.Data, image.ContentType);
        }
    }
}
