using Microsoft.AspNetCore.Identity;

namespace StellarDB.Models.Identity
{
    public class ApplicationUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool Active { get; set; } = true;
    }
}
