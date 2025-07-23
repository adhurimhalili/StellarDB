using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public UserController   (UserManager<IdentityUser> userManager,
                                 RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var users = _userManager.Users.ToList();
            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] IdentityUser user)
        {
            if (user == null)
            {
                return BadRequest("User cannot be null");
            }

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Assign roles if needed

            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }

        [HttpPut("Edit/{id}")]
        public async Task<IActionResult> EditUser(string id, [FromBody] IdentityUser user)
        {
            var userToUpdate = await _userManager.FindByIdAsync(id);
            if (userToUpdate == null)
                return NotFound($"User with ID {id} not found.");


            userToUpdate.UserName = user.UserName;
            userToUpdate.Email = user.Email;

            var result = await _userManager.UpdateAsync(userToUpdate);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Update Roles
            // Add role code...

            return Ok("User updated");
        }
    }
}
