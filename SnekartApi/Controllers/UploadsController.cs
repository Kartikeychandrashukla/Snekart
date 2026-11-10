using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using SnekartApi.Data;
using SnekartApi.Middleware;
using SnekartApi.Models;
using SnekartApi.Services;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController(IDbConnectionFactory connectionFactory, IMemoryCache cache) : ControllerBase
    {
        private readonly IDbConnectionFactory _connectionFactory = connectionFactory;
        private readonly IMemoryCache _cache = cache;

        // Thumbnail widths the frontend may request via ?w= (product cards use srcset 400/800).
        // A fixed list stops arbitrary widths from filling the cache with one-off variants.
        private static readonly HashSet<int> ThumbnailWidths = new() { 400, 800 };
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        private static readonly Dictionary<string, string> ContentTypes = new()
        {
            [".jpg"] = "image/jpeg", [".jpeg"] = "image/jpeg",
            [".png"] = "image/png", [".webp"] = "image/webp", [".gif"] = "image/gif",
        };

        // Uploads are never overwritten — a new upload always gets a new Guid, so a given URL's
        // bytes never change and browsers/CDNs can keep them for a year without re-checking.
        private const string ImmutableCacheControl = "public, max-age=31536000, immutable";

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

                // Resize + re-encode before storing — see ImageOptimizer
                var optimized = await ImageOptimizer.OptimizeAsync(ms.ToArray(), ContentTypes[ext]);

                var image = new ProductImage
                {
                    Id          = Guid.NewGuid(),
                    Data        = optimized.Data,
                    ContentType = optimized.ContentType,
                };

                using var conn = _connectionFactory.CreateConnection();
                await conn.ExecuteAsync(
                    "SELECT usp_productimage_add(@Id, @Data, @ContentType)",
                    new { image.Id, image.Data, image.ContentType });

                return Ok(new { message = "Image uploaded successfully.", url = $"/api/uploads/image/{image.Id}" });
            }
            catch (InvalidImageException ex)
            {
                return BadRequest(new { message = ex.Message });
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

                // Resize + re-encode before storing — see ImageOptimizer
                var optimized = await ImageOptimizer.OptimizeAsync(ms.ToArray(), ContentTypes[ext]);

                var image = new ProductImage
                {
                    Id          = Guid.NewGuid(),
                    Data        = optimized.Data,
                    ContentType = optimized.ContentType,
                };

                using var conn = _connectionFactory.CreateConnection();
                await conn.ExecuteAsync(
                    "SELECT usp_productimage_add(@Id, @Data, @ContentType)",
                    new { image.Id, image.Data, image.ContentType });

                return Ok(new { message = "Image uploaded successfully.", url = $"/api/uploads/image/{image.Id}" });
            }
            catch (InvalidImageException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Failed to upload image. Please try again." });
            }
        }

        [HttpGet("image/{id}")]
        public async Task<IActionResult> GetImage(Guid id, [FromQuery] int? w)
        {
            if (w.HasValue && !ThumbnailWidths.Contains(w.Value))
                return BadRequest(new { message = "Unsupported width." });

            // Resized variants are cached in memory so a busy category page doesn't re-read the
            // full image from the database and re-resize it for every new visitor.
            var cacheKey = $"img:{id}:{w}";
            if (w.HasValue && _cache.TryGetValue(cacheKey, out byte[]? cached) && cached != null)
            {
                Response.Headers.CacheControl = ImmutableCacheControl;
                return File(cached, "image/webp");
            }

            using var conn = _connectionFactory.CreateConnection();
            var image = await conn.QueryFirstOrDefaultAsync<ProductImage>(
                "SELECT * FROM usp_productimage_getbyid(@Id)",
                new { Id = id });

            if (image == null) return NotFound();
            Response.Headers.CacheControl = ImmutableCacheControl;

            if (w.HasValue)
            {
                var resized = ImageOptimizer.ResizeToWidth(image.Data, image.ContentType, w.Value);
                if (resized != null)
                {
                    _cache.Set(cacheKey, resized, new MemoryCacheEntryOptions { Size = resized.Length });
                    return File(resized, "image/webp");
                }
            }

            return File(image.Data, image.ContentType);
        }

        // Shrinks images uploaded before ImageOptimizer existed, in place (same id, so every URL
        // keeps working). Processes a small batch per call to stay well under the proxy's request
        // timeout; the admin UI calls it repeatedly, passing back "next" until remaining is 0.
        [HttpPost("images/optimize-existing")]
        [RequireAdminSession]
        public async Task<IActionResult> OptimizeExistingImages([FromQuery] Guid? after)
        {
            const int batchSize = 5;
            const int minBytes  = 150_000; // smaller images aren't worth re-encoding

            using var conn = _connectionFactory.CreateConnection();
            var batch = (await conn.QueryAsync<(Guid Id, long Remaining)>(
                "SELECT * FROM usp_productimage_listforoptimize(@After, @MinBytes, @Limit)",
                new { After = after, MinBytes = minBytes, Limit = batchSize })).ToList();

            int optimized = 0, skipped = 0;
            long bytesBefore = 0, bytesAfter = 0;

            foreach (var (id, _) in batch)
            {
                var image = await conn.QueryFirstOrDefaultAsync<ProductImage>(
                    "SELECT * FROM usp_productimage_getbyid(@Id)", new { Id = id });
                if (image == null) { skipped++; continue; }

                try
                {
                    var result = await ImageOptimizer.OptimizeAsync(image.Data, image.ContentType);
                    if (result.Data.Length >= image.Data.Length) { skipped++; continue; }

                    await conn.ExecuteAsync(
                        "SELECT usp_productimage_updatedata(@Id, @Data, @ContentType)",
                        new { Id = id, result.Data, result.ContentType });

                    optimized++;
                    bytesBefore += image.Data.Length;
                    bytesAfter  += result.Data.Length;
                }
                catch (InvalidImageException)
                {
                    skipped++; // unreadable or oversized stored file — leave it as is
                }
            }

            var remaining = batch.Count == 0 ? 0 : batch[0].Remaining - batch.Count;
            return Ok(new
            {
                optimized,
                skipped,
                bytesBefore,
                bytesAfter,
                remaining,
                next = batch.Count == 0 ? (Guid?)null : batch[^1].Id,
            });
        }

        [HttpDelete("image/{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeleteImage(Guid id)
        {
            using var conn = _connectionFactory.CreateConnection();

            var deleted = await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_productimage_delete(@Id)",
                new { Id = id });

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
                    "SELECT usp_video_add(@Id, @Data, @ContentType)",
                    new { video.Id, video.Data, video.ContentType });

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
                "SELECT * FROM usp_video_getbyid(@Id)",
                new { Id = id });

            if (video == null) return NotFound();
            Response.Headers.CacheControl = ImmutableCacheControl;
            return File(video.Data, video.ContentType, enableRangeProcessing: true);
        }

        [HttpDelete("video/{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeleteVideo(Guid id)
        {
            using var conn = _connectionFactory.CreateConnection();

            var deleted = await conn.ExecuteScalarAsync<bool>(
                "SELECT usp_video_delete(@Id)",
                new { Id = id });

            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
