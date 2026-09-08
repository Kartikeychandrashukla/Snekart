using Microsoft.AspNetCore.Mvc;
using SnekartApi.DTOs;
using SnekartApi.Middleware;
using SnekartApi.Services;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController(ICategoryService service) : ControllerBase
    {
        private readonly ICategoryService _service = service;

        [HttpGet]
        public async Task<IActionResult> GetByType([FromQuery] string type)
        {
            var categories = await _service.GetByTypeAsync(type);
            return Ok(categories);
        }

        [HttpPost]
        [RequireAdminSession]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryRequest req)
        {
            var result = await _service.CreateAsync(req);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message, category = result.Category });
        }

        [HttpPut("{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryRequest req)
        {
            var result = await _service.UpdateAsync(id, req);
            if (result.NotFound) return NotFound(new { message = result.Message });
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpDelete("{id}")]
        [RequireAdminSession]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (result.NotFound) return NotFound(new { message = result.Message });
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }
    }
}
