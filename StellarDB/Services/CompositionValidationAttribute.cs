using System.ComponentModel.DataAnnotations;
using StellarDB.Models.Composition;

namespace StellarDB.Services
{
    public class CompositionValidationAttribute : ValidationAttribute
    {
        private readonly string _compositionType;

        public CompositionValidationAttribute(string compositionType = "composition")
        {
            _compositionType = compositionType;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is List<CompositionModel> composition && composition.Any())
            {
                var sum = composition.Sum(c => c.Percentage);
                if (sum > 100)
                {
                    return new ValidationResult($"Total {_compositionType} percentages cannot exceed 100%.");
                }
            }
            return ValidationResult.Success;
        }
    }
}
