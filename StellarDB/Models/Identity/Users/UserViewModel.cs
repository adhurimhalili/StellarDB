using System.ComponentModel.DataAnnotations;

namespace StellarDB.Models.Identity.Users
{
    public class UserViewModel
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? DateOfBirth { get; set; }
        [Phone]
        public string? PhoneNumber { get; set; }
        public List<string> Roles { get; set; } = new();
        public bool Active { get; internal set; }
    }

    public class CreateUserViewModel
    {
        public string Id { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class UpdateUserViewModel
    {
        public string Id { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string UserName { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? DateOfBirth { get; set; }
        [Phone]
        public string? PhoneNumber { get; set; }
        public List<string> Roles { get; set; } = new();
        public bool Active { get; set; }
    }
}
