using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Identity;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Users;
using StellarDB.Services.Identity.Roles;

namespace StellarDB.Services.Identity.Users
{
    internal partial class UserServices : IUserServices
    {
        private readonly ApplicationDbContext _context;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ILogger<UserServices> _logger;
        private readonly IRolesServices _rolesServices;
        public UserServices
            (ApplicationDbContext context,
             SignInManager<ApplicationUser> signInManager,
             UserManager<ApplicationUser> userManager,
             RoleManager<ApplicationRole> roleManager,
             ILogger<UserServices> logger,
             IRolesServices rolesServices
            )
        {
            _context = context;
            _signInManager = signInManager;
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
            _rolesServices = rolesServices;
        }

        public async Task<List<UserViewModel>> GetAllAsync(UserQueryParameters parameters)
        {
            var query = _userManager.Users.AsQueryable()
                .Where(u => string.IsNullOrEmpty(parameters.Email) || u.Email.Contains(parameters.Email))
                .Where(u => string.IsNullOrEmpty(parameters.UserName) || u.UserName.Contains(parameters.UserName))
                .Where(u => string.IsNullOrEmpty(parameters.FirstName) || u.FirstName.Contains(parameters.FirstName))
                .Where(u => string.IsNullOrEmpty(parameters.LastName) || u.LastName.Contains(parameters.LastName))
                .Where(u => string.IsNullOrEmpty(parameters.PhoneNumber) || u.PhoneNumber.Contains(parameters.PhoneNumber))
                .Where(u => !parameters.DateOfBirthFrom.HasValue || u.DateOfBirth >= parameters.DateOfBirthFrom.Value)
                .Where(u => !parameters.DateOfBirthTo.HasValue || u.DateOfBirth >= parameters.DateOfBirthTo.Value)
                .Where(u => !parameters.Active.HasValue || u.Active == parameters.Active.Value);

            if (parameters.Active.HasValue)
                query = query.Where(u => u.Active == parameters.Active.Value);

            var users = query.ToList();
            var userViewModels = new List<UserViewModel>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);

                // If filtering by roles, skip users not in any of the specified roles
                if (parameters.Roles != null && parameters.Roles.Any())
                {
                    if (!roles.Any(r => parameters.Roles.Contains(r)))
                        continue;
                }

                var userViewModel = new UserViewModel
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DateOfBirth = user.DateOfBirth.HasValue ? user.DateOfBirth.Value.ToString("dd/MM/yyyy") : null,
                    PhoneNumber = user.PhoneNumber ?? null,
                    Roles = roles.ToList(),
                    Active = user.Active
                };

                userViewModels.Add(userViewModel);
            }
            return userViewModels;
        }

        public async Task<UserViewModel> GetByIdAsync(string userId)
        {
            ApplicationUser? findUser = await _userManager.FindByIdAsync(userId);
            if (findUser is null) throw new Exception($"User with the ID [{userId}] not found.");

            // Get role names for the user
            var roleNames = await _userManager.GetRolesAsync(findUser);

            // Get all roles from the RoleManager
            var allRoles = _roleManager.Roles.ToList();

            // Map role names to role IDs
            var roleIds = allRoles
                .Where(r => roleNames.Contains(r.Name))
                .Select(r => r.Id)
                .ToList();

            UserViewModel user = new UserViewModel
            {
                Id = findUser.Id,
                Email = findUser.Email,
                UserName = findUser.UserName ?? string.Empty,
                FirstName = findUser.FirstName,
                LastName = findUser.LastName,
                DateOfBirth = findUser.DateOfBirth.HasValue ? findUser.DateOfBirth.Value.ToString("dd/MM/yyyy") : string.Empty,
                PhoneNumber = findUser.PhoneNumber ?? string.Empty,
                Roles = roleIds,
                Active = findUser.Active
            };
            return user;
        }

        public async Task ToggleStatusAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new Exception($"User with ID {userId} not found.");
            if (user.Active) user.Active = false;
            else user.Active = true;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
}
