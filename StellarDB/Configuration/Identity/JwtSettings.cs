using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace StellarDB.Configuration.Identity
{
    public class JwtSettings : IValidatableObject
    {
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public string SecretKey { get; set; } = string.Empty;
        public int TokenExpirationInMinutes { get; set; }
        public int RefreshTokenExpirationInDays { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrWhiteSpace(SecretKey))
            {
                yield return new ValidationResult("JWT Key is required.", new[] { nameof(SecretKey) });
            }
        }
    }
}
