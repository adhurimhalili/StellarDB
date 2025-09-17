using Microsoft.AspNetCore.Identity;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Roles;
using System.Security.Claims;

namespace StellarDB.Services.Identity.Roles
{
    internal partial class RolesServices : IRolesServices
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

            var roleViewModels = new List<RoleViewModel>();

            foreach (var r in roles)
            {
                var claims = await _roleManager.GetClaimsAsync(r);
                roleViewModels.Add(new RoleViewModel
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    RoleClaims = claims.Select(c => new RoleClaimModel
                    {
                        ClaimType = c.Type,
                        ClaimValue = c.Value
                    }).ToList()
                });
            }

            return roleViewModels;
        }

        public async Task<RoleViewModel?> GetRoleByIdAsync(string roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null) return null;
            var roleClaims = await _roleManager.GetClaimsAsync(role);
            return new RoleViewModel
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                RoleClaims = roleClaims.Select(c => new RoleClaimModel
                {
                    ClaimType = c.Type,
                    ClaimValue = c.Value
                }).ToList()
            };
        }

        public async Task<(IdentityResult Result, string RoleId)> CreateRoleAsync(RoleViewModel model)
        {
            var role = new ApplicationRole(model.Name, model.Description);
            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            await AddRoleClaimsAsync(model, role.Id);
            return (result, role.Id);
        }

        public async Task<bool> UpdateRoleAsync(RoleViewModel model)
        {
            var role = await _roleManager.FindByIdAsync(model.Id);
            if (role == null)
                throw new Exception($"Role with ID {model.Id} not found.");

            role.Name = model.Name;
            role.Description = model.Description;
            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            await SyncRoleClaimsAsync(role, model.RoleClaims ?? new List<RoleClaimModel>());
            return true;
        }

        public async Task<string> DeleteRoleAsync(string roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null)
                throw new Exception($"Role with ID [{roleId}] not found.");

            // Remove all claims associated with this role
            var claims = await _roleManager.GetClaimsAsync(role);
            foreach (var claim in claims)
            {
                var removeClaimResult = await _roleManager.RemoveClaimAsync(role, claim);
                if (!removeClaimResult.Succeeded)
                    throw new Exception($"Failed to remove claim '{claim.Type}:{claim.Value}' from role '{role.Name}': " +
                        string.Join(", ", removeClaimResult.Errors.Select(e => e.Description)));
            }

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

        private async Task AddRoleClaimsAsync(RoleViewModel model, string roleId)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (model.RoleClaims == null) throw new ArgumentNullException(nameof(model.RoleClaims));

            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null) throw new InvalidOperationException($"Role with ID '{model.Id}' not found.");

            foreach (var claim in model.RoleClaims)
            {
                var roleClaim = new Claim(claim.ClaimType, claim.ClaimValue);

                // Optional: Check if claim already exists
                var existingClaims = await _roleManager.GetClaimsAsync(role);
                if (existingClaims.Any(c => c.Type == claim.ClaimType && c.Value == claim.ClaimValue))
                    continue;

                var result = await _roleManager.AddClaimAsync(role, roleClaim);
                if (!result.Succeeded)
                {
                    throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }


        /// <summary>
        /// Synchronizes the claims of a role to match the provided list.
        /// Removes claims not present in the new list and adds missing ones.
        /// </summary>
        private async Task SyncRoleClaimsAsync(ApplicationRole role, List<RoleClaimModel> desiredClaims)
        {
            var currentClaims = await _roleManager.GetClaimsAsync(role);

            foreach (var claim in currentClaims)
            {
                if (!desiredClaims.Any(dc => dc.ClaimType == claim.Type && dc.ClaimValue == claim.Value))
                {
                    await _roleManager.RemoveClaimAsync(role, claim);
                }
            }

            foreach (var desired in desiredClaims)
            {
                if (!currentClaims.Any(c => c.Type == desired.ClaimType && c.Value == desired.ClaimValue))
                {
                    var addResult = await _roleManager.AddClaimAsync(role, new Claim(desired.ClaimType, desired.ClaimValue));
                    if (!addResult.Succeeded)
                        throw new InvalidOperationException(string.Join(", ", addResult.Errors.Select(e => e.Description)));
                }
            }
        }
    }
}
