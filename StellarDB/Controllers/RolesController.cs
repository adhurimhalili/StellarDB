using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Identity.Roles;
using StellarDB.Services.Identity.Roles;

namespace StellarDB.Controllers
{
    [Authorize(Policy = "IdentityAccess")]
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly ILogger<RolesController> _logger;
        private readonly IRolesServices _rolesServices;

        public RolesController(
            IRolesServices rolesServices,
            ILogger<RolesController> logger)
        {
            _rolesServices = rolesServices;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var roles = await _rolesServices.GetAllRolesAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles");
                return StatusCode(500, "An error occurred while retrieving roles");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRole(string id)
        {
            try
            {
                var role = await _rolesServices.GetRoleByIdAsync(id);
                if (role == null)
                    return NotFound($"Role with ID {id} not found.");

                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role {RoleId}", id);
                return StatusCode(500, "An error occurred while retrieving the role");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] RoleViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var (result, roleId) = await _rolesServices.CreateRoleAsync(model);
                
                if (!result.Succeeded)
                    return BadRequest(result.Errors);

                // Get the created role to return in response
                var createdRole = await _rolesServices.GetRoleByIdAsync(roleId);
                return CreatedAtAction(nameof(GetRole), new { id = roleId }, createdRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role");
                return StatusCode(500, "An error occurred while creating the role");
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdateRole([FromBody] RoleViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                bool succeeded = await _rolesServices.UpdateRoleAsync(model);
                if (!succeeded) return BadRequest("Failed to update the role");
                return Ok(new { message = "Role updated successfully" });
            }
            catch (Exception ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role {RoleId}", model.Id);
                return StatusCode(500, "An error occurred while updating the role");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            try
            {
                var roleId = await _rolesServices.DeleteRoleAsync(id);
                return NoContent();
            }
            catch (Exception ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role {RoleId}", id);
                return StatusCode(500, "An error occurred while deleting the role");
            }
        }
    }
}
