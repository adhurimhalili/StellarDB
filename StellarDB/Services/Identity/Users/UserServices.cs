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

        public async Task<List<UserViewModel>> GetAllAsync()
        {
            var users = _userManager.Users.ToList();
            var userViewModels = new List<UserViewModel>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);

                var userViewModel = new UserViewModel
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DateOfBirth = user.DateOfBirth,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    Roles = roles.ToList()
                };

                userViewModels.Add(userViewModel);
            }
            return userViewModels;
        }
        public async Task<UserViewModel> GetByIdAsync(string userId)
        {
            ApplicationUser? findUser = await _userManager.FindByIdAsync(userId);
            if (findUser is null) throw new Exception($"User with the ID [{userId}] not found.");
            UserViewModel user = new UserViewModel
            {
                Id = findUser.Id,
                Email = findUser.Email,
                UserName = findUser.UserName ?? string.Empty,
                FirstName = findUser.FirstName,
                LastName = findUser.LastName,
                DateOfBirth = findUser.DateOfBirth,
                PhoneNumber = findUser.PhoneNumber ?? string.Empty,
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
