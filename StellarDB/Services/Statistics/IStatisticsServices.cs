namespace StellarDB.Services.Statistics
{
    public interface IStatisticsServices
    {
        /// <summary>
        /// Returns a dictionary of planet type names and their respective counts.
        /// </summary>
        Task<IDictionary<string, int>> GetPlanetCountByTypeAsync();
    }
}
