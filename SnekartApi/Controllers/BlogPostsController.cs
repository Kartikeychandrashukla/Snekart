using Microsoft.AspNetCore.Mvc;
using SnekartApi.DTOs;
using SnekartApi.Middleware;
using SnekartApi.Services;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogPostsController(IBlogPostService service) : ControllerBase
    {
        private readonly IBlogPostService _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAllPosts()
        {
            var posts = await _service.GetAllPostsAsync();
            return Ok(posts);
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetPostBySlug(string slug)
        {
            var post = await _service.GetPostBySlugAsync(slug);
            if (post == null) return NotFound(new { message = "Post not found." });
            return Ok(post);
        }

        [HttpPost]
        [RequireAdminSession]
        public async Task<IActionResult> CreatePost([FromBody] BlogPostRequest req)
        {
            var result = await _service.CreatePostAsync(req);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message, post = result.Post });
        }

        [HttpPut("{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] BlogPostRequest req)
        {
            var result = await _service.UpdatePostAsync(id, req);
            if (result.NotFound) return NotFound(new { message = result.Message });
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpDelete("{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeletePost(int id)
        {
            var result = await _service.DeletePostAsync(id);
            if (result.NotFound) return NotFound(new { message = result.Message });
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }
    }
}
