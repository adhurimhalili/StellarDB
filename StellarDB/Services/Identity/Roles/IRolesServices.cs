using Microsoft.AspNetCore.Identity;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Roles;

namespace StellarDB.Services.Identity.Roles
{
    public interface IRolesServices
    {
        Task<List<RoleViewModel>> GetAllRolesAsync();
        Task<RoleViewModel?> GetRoleByIdAsync(string roleId);
        Task<(IdentityResult Result, string RoleId)> CreateRoleAsync(RoleViewModel model);
        Task<string> UpdateRoleAsync(RoleViewModel model);
        Task<string?> DeleteRoleAsync(string roleId);
        Task<bool> AddUserToRolesAsync(ApplicationUser user, IEnumerable<string> roles);
        Task<bool> RemoveUserFromRolesAsync(ApplicationUser user, IEnumerable<string> roles);
        Task<bool> UpdateUserRolesAsync(ApplicationUser user, IEnumerable<string> newRoles);
    }
}
