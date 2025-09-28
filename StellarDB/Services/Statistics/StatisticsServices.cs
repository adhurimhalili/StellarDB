using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.Planet;
using StellarDB.Models.PlanetTypes;

namespace StellarDB.Services.Statistics
{
    public class StatisticsServices : IStatisticsServices
    {
        private readonly IMongoCollection<PlanetModel> _planets;
        private readonly IMongoCollection<PlanetTypesModel> _planetTypes;
        public StatisticsServices(MongoDbService mongoDbService)
        {
            _planets = mongoDbService.Database!.GetCollection<PlanetModel>("Planets");
            _planetTypes = mongoDbService.Database!.GetCollection<PlanetTypesModel>("PlanetTypes");
        }

        public async Task<IDictionary<string, int>> GetPlanetCountByTypeAsync()
        {
            // Aggregate planet counts by type id
            var group = await _planets.Aggregate()
                .Group(p => p.PlanetTypeId, g => new { PlanetTypeId = g.Key, Count = g.Count() })
                .ToListAsync();

            // Get all planet types
            var types = await _planetTypes.Find(_ => true).ToListAsync();
            var typeDict = types.ToDictionary(t => t.Id, t => t.Name);

            // Map type id to type name and count
            var result = new Dictionary<string, int>();
            foreach (var item in group)
            {
                if (typeDict.TryGetValue(item.PlanetTypeId, out var typeName))
                {
                    result[typeName] = item.Count;
                }
                else
                {
                    result["Unknown"] = result.TryGetValue("Unknown", out var c) ? c + item.Count : item.Count;
                }
            }
            return result;
        }
    }
}
