using Azure.Core;
using Microsoft.AspNetCore.Identity;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Auth;
using StellarDB.Models.Identity.Tokens;
using StellarDB.Services.Identity.Token;

namespace StellarDB.Services.Identity.Auth
{
    public class AuthServices : IAuthServices
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<AuthServices> _logger;
        private readonly ITokenServices _tokenServices;
        public AuthServices(
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager,
            ILogger<AuthServices> logger,
            ITokenServices tokenServices)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _logger = logger;
            _tokenServices = tokenServices;
        }

        public async Task<(bool succeeded, string message, TokenResponse token)> LoginAsync(LoginRequest request, string ipAddress)
        {
            var user = await _userManager.FindByEmailAsync(request.Email.Trim());
            bool isValidUser = await ValidateUserAsync(user!, request.Password);
            if (!isValidUser) return (false, "Invalid email or password", null!);

            var token = await _tokenServices.GenerateTokenAsync(user!, ipAddress);
            return (true, "Login successful", token);
        }

        public async Task LogoutAsync()
        {
            await _signInManager.SignOutAsync();
        }

        private async Task<bool> ValidateUserAsync(ApplicationUser user, string password)
        {
            var isPasswordValid = await _userManager.CheckPasswordAsync(user!, password);
            if (user == null || !isPasswordValid || !user.Active || !user.EmailConfirmed) return false;
            return true;
        }
    }
}
