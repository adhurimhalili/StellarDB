using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Identity.Users;
using StellarDB.Services.Identity.Users;

namespace StellarDB.Controllers
{
    [Authorize(Policy = "IdentityAccess")]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IUserServices _userServices;

        public UserController(ILogger<UserController> logger, IUserServices userServices)
        {
            _logger = logger;
            _userServices = userServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] UserQueryParameters parameters)
        {
            var users = await _userServices.GetAllAsync(parameters);
            return Ok(users);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            return await _userServices.GetByIdAsync(id) is UserViewModel user
                ? Ok(user)
                : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = await _userServices.CreateAsync(model);
                return CreatedAtAction(nameof(Get), new { id = userId }, model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> EditUser([FromBody] UpdateUserViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _userServices.UpdateAsync(model);
                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user");
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("toggle-status/{id}")]
        public async Task<IActionResult> ToggleUserStatus(string id)
        {
            try
            {
                await _userServices.ToggleStatusAsync(id);
                return Ok("User status toggled successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling user status");
                return BadRequest(ex.Message);
            }
        }
    }
}
