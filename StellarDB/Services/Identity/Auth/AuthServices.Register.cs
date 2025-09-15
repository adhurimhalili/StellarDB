using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Auth;

namespace StellarDB.Services.Identity.Auth
{
    internal partial class AuthServices
    {
        public async Task<string> RegisterAsync(RegisterRequest model)
        {
            var user = new ApplicationUser
            {
                UserName = model.UserName,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                DateOfBirth = model.DateOfBirth,
                Active = true,
                EmailConfirmed = true, // In a real application, you might want to send a confirmation email instead
                PhoneNumber = model.PhoneNumber
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            return user.Id;
        }
    }
}
