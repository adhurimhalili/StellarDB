using StellarDB.Models.Identity.Users;

namespace StellarDB.Services.Identity.Users
{
    public interface IUserServices
    {
        Task<List<UserViewModel>> GetAllAsync();
        Task ToggleStatusAsync(string userId);
        Task<string> CreateAsync(CreateUserViewModel model, string origin);
        Task<string> UpdateAsync(UpdateUserViewModel model, string origin);
    }
}
