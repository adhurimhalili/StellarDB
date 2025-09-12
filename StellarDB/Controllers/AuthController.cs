using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Identity.Auth;
using StellarDB.Models.Identity.Tokens;
using StellarDB.Services.Identity.Auth;
using StellarDB.Services.Identity.Token;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly IAuthServices _authServices;
        private readonly ITokenServices _tokenServices;
        public AuthController(
            ILogger<AuthController> logger,
            IAuthServices authServices,
            ITokenServices tokenServices)
        {
            _logger = logger;
            _authServices = authServices;
            _tokenServices = tokenServices;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            (bool succeeded, string message, TokenResponse token) = await _authServices.LoginAsync(request, GetIPAddress()!);
            if (succeeded) return Ok(token);
            return Unauthorized(new { message });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _authServices.LogoutAsync();
            return Ok(new { message = "Logged out successfully" });
        }

        private string? GetIPAddress() =>
            Request.Headers.ContainsKey("X-Forwarded-For") 
            ? Request.Headers["X-Forwarded-For"]
            : HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "N/A";
    }
}
