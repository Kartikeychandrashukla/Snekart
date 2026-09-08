using System.Data;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using SnekartApi.Data;
using SnekartApi.Middleware;
using SnekartApi.Models;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController(IDbConnectionFactory connectionFactory) : ControllerBase
    {
        private readonly IDbConnectionFactory _connectionFactory = connectionFactory;
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

                using var conn = _connectionFactory.CreateConnection();
                await conn.ExecuteAsync(
                    "usp_ProductImage_Add",
                    new { image.Id, image.Data, image.ContentType },
                    commandType: CommandType.StoredProcedure);

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

                using var conn = _connectionFactory.CreateConnection();
                await conn.ExecuteAsync(
                    "usp_ProductImage_Add",
                    new { image.Id, image.Data, image.ContentType },
                    commandType: CommandType.StoredProcedure);

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
            using var conn = _connectionFactory.CreateConnection();
            var image = await conn.QueryFirstOrDefaultAsync<ProductImage>(
                "usp_ProductImage_GetById",
                new { Id = id },
                commandType: CommandType.StoredProcedure);

            if (image == null) return NotFound();
            return File(image.Data, image.ContentType);
        }

        [HttpDelete("image/{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeleteImage(Guid id)
        {
            using var conn = _connectionFactory.CreateConnection();

            var deleted = await conn.ExecuteScalarAsync<bool>(
                "usp_ProductImage_Delete",
                new { Id = id },
                commandType: CommandType.StoredProcedure);

            if (!deleted) return NotFound();
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

                using var conn = _connectionFactory.CreateConnection();
                await conn.ExecuteAsync(
                    "usp_Video_Add",
                    new { video.Id, video.Data, video.ContentType },
                    commandType: CommandType.StoredProcedure);

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
            using var conn = _connectionFactory.CreateConnection();
            var video = await conn.QueryFirstOrDefaultAsync<Video>(
                "usp_Video_GetById",
                new { Id = id },
                commandType: CommandType.StoredProcedure);

            if (video == null) return NotFound();
            return File(video.Data, video.ContentType, enableRangeProcessing: true);
        }

        [HttpDelete("video/{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeleteVideo(Guid id)
        {
            using var conn = _connectionFactory.CreateConnection();

            var deleted = await conn.ExecuteScalarAsync<bool>(
                "usp_Video_Delete",
                new { Id = id },
                commandType: CommandType.StoredProcedure);

            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
