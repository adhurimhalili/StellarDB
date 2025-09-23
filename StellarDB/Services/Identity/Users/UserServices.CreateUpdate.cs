using Microsoft.AspNetCore.Http.HttpResults;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Users;

namespace StellarDB.Services.Identity.Users
{
    internal partial class UserServices
    {
        public async Task<string> CreateAsync(CreateUserViewModel model)
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
                foreach (var roleId in model.Roles)
                {
                    var role = await _roleManager.FindByIdAsync(roleId);
                    if (role is not null)
                    {
                        await _userManager.AddToRoleAsync(user, role.Name);
                    }
                }
            }

            return user.Id;
        }

        public async Task<string> UpdateAsync(UpdateUserViewModel model)
        {
            var user = await _userManager.FindByIdAsync(model.Id);

            if (user == null)
                throw new Exception($"User with ID {model.Id} not found.");

            user.UserName = model.UserName;
            user.Email = model.Email;
            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.DateOfBirth = string.IsNullOrWhiteSpace(model.DateOfBirth)
                ? null
                : DateTime.TryParse(model.DateOfBirth, out var dob) ? dob : throw new Exception("Invalid date format for DateOfBirth.");
            user.PhoneNumber = model.PhoneNumber;
            user.Active = model.Active;
            var result = await _userManager.UpdateAsync(user);

            await _signInManager.RefreshSignInAsync(user);

            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            if (model.Roles != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                var rolesToAdd = model.Roles.Except(currentRoles).ToList();
                var rolesToRemove = currentRoles.Except(model.Roles).ToList();

                foreach (var roleId in rolesToAdd)
                {
                    var role = await _roleManager.FindByIdAsync(roleId);
                    if (role is not null)
                    {
                        await _userManager.AddToRoleAsync(user, role.Name);
                    }
                }

                foreach (var roleId in rolesToRemove)
                {
                    var role = await _roleManager.FindByIdAsync(roleId);
                    if (role is not null)
                    {
                        await _userManager.RemoveFromRoleAsync(user, role.Name);
                    }
                }
            }

            return user.Id;
        }
    }
}
