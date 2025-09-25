using StellarDB.Models.Identity.Users;

namespace StellarDB.Services.Identity.Users
{
    public interface IUserServices
    {
        Task<List<UserViewModel>> GetAllAsync(UserQueryParameters parameters);
        Task<UserViewModel> GetByIdAsync(string userId);
        Task ToggleStatusAsync(string userId);
        Task<string> CreateAsync(CreateUserViewModel model);
        Task<string> UpdateAsync(UpdateUserViewModel model);
    }
}
