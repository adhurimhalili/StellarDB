using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Auth;
using StellarDB.Models.Identity.Tokens;

namespace StellarDB.Services.Identity.Auth
{
    public interface IAuthServices
    {
        Task<(bool succeeded, string message, TokenResponse token)> LoginAsync(LoginRequest request, string ipAddress);
        Task LogoutAsync();
        Task<(bool succeeded, string message)> RegisterAsync(RegisterRequest request);
        Task ConfirmEmailAsync(string userId, string token);
    }
}
