
using Microsoft.AspNetCore.Identity;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Roles;

namespace StellarDB.Services.Identity.Roles
{
    public class RolesServices : IRolesServices
    {
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<RolesServices> _logger;

        public RolesServices(
            ApplicationDbContext context,
            RoleManager<ApplicationRole> roleManager,
            UserManager<ApplicationUser> userManager,
            ILogger<RolesServices> logger)
        {
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
            _logger = logger;
        }
        public async Task<List<RoleViewModel>> GetAllRolesAsync()
        {
            var roles = _roleManager.Roles.ToList();
            var roleViewModels = roles.Select(r => new RoleViewModel
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description
            }).ToList();
            return roleViewModels;
        }

        public async Task<RoleViewModel?> GetRoleByIdAsync(string roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null) return null;
            return new RoleViewModel
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description
            };
        }

        public async Task<(IdentityResult Result, string RoleId)> CreateRoleAsync(RoleViewModel model)
        {
            var role = new ApplicationRole(model.Name, model.Description);
            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            return (result, role.Id);
        }

        public async Task<string> UpdateRoleAsync(RoleViewModel model)
        {
            var role = await _roleManager.FindByIdAsync(model.Id);
            if (role == null)
                throw new Exception($"Role with ID {model.Id} not found.");
            role.Name = model.Name;
            role.Description = model.Description;
            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            return role.Id;
        }

        public async Task<string> DeleteRoleAsync(string roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null)
                throw new Exception($"Role with ID {roleId} not found.");
            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            return role.Id;
        }

        public async Task<bool> AddUserToRolesAsync(ApplicationUser user, IEnumerable<string> roles)
        {
            if (!roles.Any()) return true;

            foreach (var role in roles)
            {
                if (await _roleManager.RoleExistsAsync(role))
                {
                    var result = await _userManager.AddToRoleAsync(user, role);
                    if (!result.Succeeded)
                    {
                        _logger.LogError("Failed to add role {Role} to user {User}", role, user.UserName);
                        return false;
                    }
                }
                else
                {
                    _logger.LogWarning("Role {Role} does not exist and was not assigned to user {User}", role, user.UserName);
                }
            }
            return true;
        }

        public async Task<bool> RemoveUserFromRolesAsync(ApplicationUser user, IEnumerable<string> roles)
        {
            if (!roles.Any()) return true;

            foreach (var role in roles)
            {
                if (await _roleManager.RoleExistsAsync(role))
                {
                    var result = await _userManager.RemoveFromRoleAsync(user, role);
                    if (!result.Succeeded)
                    {
                        _logger.LogError("Failed to remove role {Role} from user {User}", role, user.UserName);
                        return false;
                    }
                }
            }
            return true;
        }

        public async Task<bool> UpdateUserRolesAsync(ApplicationUser user, IEnumerable<string> newRoles)
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            var rolesToAdd = newRoles.Except(currentRoles);
            var rolesToRemove = currentRoles.Except(newRoles);

            var removeSuccess = await RemoveUserFromRolesAsync(user, rolesToRemove);
            if (!removeSuccess) return false;

            var addSuccess = await AddUserToRolesAsync(user, rolesToAdd);
            return addSuccess;
        }
    }
}
