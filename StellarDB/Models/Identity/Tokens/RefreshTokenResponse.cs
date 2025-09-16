namespace StellarDB.Models.Identity.Tokens
{
    public record RefreshTokenRequest(string Token, string RefreshToken);
}
