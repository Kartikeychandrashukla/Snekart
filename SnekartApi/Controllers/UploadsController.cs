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

        private static readonly string[] AllowedVideoExtensions = { ".mp4", ".webm", ".mov" };
        private static readonly Dictionary<string, string> VideoContentTypes = new()
        {
            [".mp4"] = "video/mp4", [".webm"] = "video/webm", [".mov"] = "video/quicktime",
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

        // Public (no admin session) — review submitters aren't authenticated, matching
        // the equally-anonymous POST /api/products/{slug}/reviews. Kept as a separate
        // route/size cap from the admin upload so the admin-only product/blog upload
        // path isn't opened up to anonymous callers.
        [HttpPost("review-image")]
        [RequestSizeLimit(5_000_000)]
        public async Task<IActionResult> UploadReviewImage(IFormFile file)
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

        [HttpDelete("image/{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeleteImage(Guid id)
        {
            var image = await _db.ProductImages.FindAsync(id);
            if (image == null) return NotFound();

            _db.ProductImages.Remove(image);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("video")]
        [RequestSizeLimit(50_000_000)]
        [RequireAdminSession]
        public async Task<IActionResult> UploadVideo(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedVideoExtensions.Contains(ext))
                return BadRequest(new { message = "Unsupported file type. Use mp4, webm or mov." });

            try
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);

                var video = new Video
                {
                    Id          = Guid.NewGuid(),
                    Data        = ms.ToArray(),
                    ContentType = VideoContentTypes[ext],
                };

                _db.Videos.Add(video);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Video uploaded successfully.", url = $"/api/uploads/video/{video.Id}" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Failed to upload video. Please try again." });
            }
        }

        [HttpGet("video/{id}")]
        public async Task<IActionResult> GetVideo(Guid id)
        {
            var video = await _db.Videos.FindAsync(id);
            if (video == null) return NotFound();
            return File(video.Data, video.ContentType, enableRangeProcessing: true);
        }

        [HttpDelete("video/{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeleteVideo(Guid id)
        {
            var video = await _db.Videos.FindAsync(id);
            if (video == null) return NotFound();

            _db.Videos.Remove(video);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
