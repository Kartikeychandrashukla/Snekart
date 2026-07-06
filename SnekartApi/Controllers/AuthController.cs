using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SnekartApi.Services;

namespace SnekartApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> Register([FromBody] AuthRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Name) ||
                string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { message = "All fields are required." });

            if (req.Password.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters." });

            var result = await _auth.RegisterAsync(req.Name, req.Email, req.Password);
            if (!result.Success) return BadRequest(new { message = result.Message });
            Response.Cookies.Append("snekart_token", result.Token!, new CookieOptions
    {
        HttpOnly = true,
        Secure   = true,
        SameSite = SameSiteMode.None,
        Expires  = DateTimeOffset.UtcNow.AddDays(1),
    });

             result.Token=null;
            return Ok(result);
        }

     [HttpPost("login")]
[EnableRateLimiting("auth")]
public async Task<IActionResult> Login([FromBody] AuthRequest req)
{
    var result = await _auth.LoginAsync(req.Email, req.Password);
    if (!result.Success) return Unauthorized(new { message = result.Message });

    Response.Cookies.Append("snekart_token", result.Token!, new CookieOptions
    {
        HttpOnly = true,
        Secure   = true,
        SameSite = SameSiteMode.None,
        Expires  = DateTimeOffset.UtcNow.AddDays(1),
    });

    result.Token = null;   // don't leak it into the JSON body — it's already in the cookie
    return Ok(result);
}


        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
           var token = Request.Cookies["snekart_token"];
            if (!string.IsNullOrEmpty(token))
                await _auth.LogoutAsync(token);
            Response.Cookies.Delete("snekart_token");
            return Ok(new { message = "Logged out." });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            if (HttpContext.Items["CustomerId"] is not int customerId)
                return Unauthorized();

            return Ok(new
            {
                id    = customerId,
                name  = HttpContext.Items["CustomerName"] as string,
                level = HttpContext.Items["Level"] as string,
            });
        }
    }

    public class AuthRequest
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }
}
