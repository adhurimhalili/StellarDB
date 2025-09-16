using Microsoft.AspNetCore.Http.HttpResults;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Users;

namespace StellarDB.Services.Identity.Users
{
    internal partial class UserServices
    {
        public async Task<string> CreateAsync(CreateUserViewModel model, string origin)
        {
            var user = new ApplicationUser
            {
                UserName = model.UserName,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                DateOfBirth = model.DateOfBirth
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            if (model.Roles?.Any() == true)
            {
                foreach (var role in model.Roles)
                {
                    if (await _roleManager.RoleExistsAsync(role))
                    {
                        await _userManager.AddToRoleAsync(user, role);
                    }
                }
            }

            return user.Id;
        }

        public async Task<string> UpdateAsync(UpdateUserViewModel model, string origin)
        {
            var user = await _userManager.FindByIdAsync(model.Id);

            if (user == null)
                throw new Exception($"User with ID {model.Id} not found.");

            user.UserName = model.UserName;
            user.Email = model.Email;
            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.DateOfBirth = model.DateOfBirth;
            var result = await _userManager.UpdateAsync(user);

            await _signInManager.RefreshSignInAsync(user);

            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            if (model.Roles.Any())
            {
                var roleUpdateSuccess = await _rolesServices.UpdateUserRolesAsync(user, model.Roles);
                if (!roleUpdateSuccess)
                    _logger.LogWarning("Some role updates failed for user {UserId}", user.Id);
            }

            return user.Id;
        }
    }
}
