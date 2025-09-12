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
            throw new NotImplementedException();
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
