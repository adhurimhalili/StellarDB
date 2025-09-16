using Microsoft.AspNetCore.Authentication.BearerToken;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Tokens;

namespace StellarDB.Services.Identity.Token
{
    public interface ITokenServices
    {
        Task<TokenResponse> GenerateTokenAsync(ApplicationUser user, string userName);
        Task<bool> ValidateTokenAsync(string token);
        Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request, string ipAddress);
    }
}
