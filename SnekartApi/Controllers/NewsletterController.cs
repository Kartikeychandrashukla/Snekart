using Microsoft.AspNetCore.Mvc;
using SnekartApi.DTOs;
using SnekartApi.Services;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/newsletter")]
    public class NewsletterController(INewsletterService service) : ControllerBase
    {
        private readonly INewsletterService _service = service;

        [HttpPost("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeRequest req)
        {
            var result = await _service.SubscribeAsync(req);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(new { message = result.Message });
        }

        [HttpGet("unsubscribe/{token}")]
        public async Task<IActionResult> Unsubscribe(Guid token)
        {
            var unsubscribed = await _service.UnsubscribeAsync(token);
            var html = unsubscribed
                ? "<h2>You've been unsubscribed.</h2><p>You won't receive any more emails from Snekart.</p>"
                : "<h2>Link expired</h2><p>This unsubscribe link is invalid or has already been used.</p>";
            return Content(html, "text/html");
        }
    }
}
