using StellarDB.Models.Moon;

namespace StellarDB.Services.Moons
{
    public interface IMoonsServices
    {
        Task<IEnumerable<object>> GetAllAsync(MoonQueryParameters parameters);
        Task<MoonModel?> GetByIdAsync(string id);
        Task<bool> CreateAsync(MoonModel model);
        Task<bool> UpdateAsync(MoonModel model);
        Task<bool> DeleteAsync(string id);
        Task<(int inserted, int skipped)> ImportFileAsync(IFormFile file);
        Task<(byte[] fileBytes, string fileContentType, string fullFileName)> ExportFileAsync(string format);
    }
}
