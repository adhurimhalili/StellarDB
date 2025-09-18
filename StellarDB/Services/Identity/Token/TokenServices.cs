using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using StellarDB.Configuration.Identity;
using StellarDB.Migrations;
using StellarDB.Models.Identity;
using StellarDB.Models.Identity.Tokens;
using StellarDB.Services.Identity.Users;

namespace StellarDB.Services.Identity.Token
{
    public class TokenServices : ITokenServices
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUserServices _userServices;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly JwtSettings _jwtSettings;
        public TokenServices(UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IUserServices userServices,
            IOptions<JwtSettings> jwtSettings)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _userServices = userServices;
            _jwtSettings = jwtSettings.Value;
        }
        public async Task<TokenResponse> GenerateTokenAsync(ApplicationUser user, string ipAddress)
        {
            string token = await GenerateJwtTokenAsync(user, ipAddress);
            user.RefreshToken = GenerateRefreshToken();
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationInDays);
            await _userManager.UpdateAsync(user);
            return new TokenResponse(token, user.RefreshToken, user.RefreshTokenExpiryTime);
        }

        public async Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request, string ipAddress)
        {
            var userPrincipal = GetPrincipalFromExpiredToken(request.Token);
            string? userEmail = userPrincipal?.FindFirstValue(JwtRegisteredClaimNames.Email);
            var user = await _userManager.FindByEmailAsync(userEmail!);
            if (user == null)
            {
                return null;
            }

            if (user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new SecurityTokenException("Invalid Refresh Token.");
            }

            return await GenerateTokenAsync(user, ipAddress);
        }
        public async Task<bool> ValidateTokenAsync(string token)
        {
            throw new NotImplementedException();
        }

        private async Task<string> GenerateJwtTokenAsync(ApplicationUser user, string ipAddress) =>
            GenerateEncryptedToken(GetSigningCredentials(), await GetClaims(user, ipAddress));

        private string GenerateEncryptedToken(SigningCredentials signingCredentials, IEnumerable<Claim> claims)
        {
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.TokenExpirationInMinutes),
                signingCredentials: signingCredentials);
            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.WriteToken(token);
        }

        private async Task<IEnumerable<Claim>> GetClaims(ApplicationUser user, string ipAddress)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("ip", ipAddress)
            };
            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
            var userClaims = await _userManager.GetClaimsAsync(user);
            var role = await _roleManager.FindByNameAsync(roles.FirstOrDefault() ?? string.Empty);
            IList<Claim> roleClaims = null;
            if (role != null) roleClaims = await _roleManager.GetClaimsAsync(role);
            claims.AddRange(userClaims.Any() ? userClaims : []);
            claims.AddRange(roleClaims != null && roleClaims.Any() ? roleClaims : Array.Empty<Claim>());
            return claims;
        }

        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private SigningCredentials GetSigningCredentials()
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            return new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false, // We want to get claims from expired tokens as well
                RoleClaimType = ClaimTypes.Role,
                ClockSkew = TimeSpan.Zero
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }
            return principal;
        }
    }
}
