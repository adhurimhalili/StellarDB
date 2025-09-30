using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.ChemicalElements;
using StellarDB.Models.Moon;
using StellarDB.Models.Planet;
using System.Text.Json;
using System.Xml.Serialization;

namespace StellarDB.Services.Moons
{
    public class MoonsServices : IMoonsServices
    {
        private readonly IMongoCollection<MoonModel>? _moons;
        private readonly IMongoCollection<ChemicalElementsModel>? _chemicalElements;
        private readonly IMongoCollection<PlanetModel>? _planets;
        private readonly CsvServices _csvServices;
        public MoonsServices(MongoDbService mongoDbService,
            CsvServices csvServices)
        {
            _moons = mongoDbService.Database.GetCollection<MoonModel>("Moons");
            _planets = mongoDbService.Database.GetCollection<PlanetModel>("Planets");
            _chemicalElements = mongoDbService.Database.GetCollection<ChemicalElementsModel>("ChemicalElements");
            _csvServices = csvServices;
        }

        public async Task<IEnumerable<object>> GetAllAsync(MoonQueryParameters parameters)
        {
            var filter = await BuildMoonFilter(parameters);
            List<MoonModel>? moons = await _moons.Find(filter).ToListAsync();

            var planets = await _planets.Find(FilterDefinition<PlanetModel>.Empty).ToListAsync();
            var chemicalElements = await _chemicalElements.Find(FilterDefinition<ChemicalElementsModel>.Empty).ToListAsync();
            var planetDict = planets
                .Where(p => p.Id is not null)
                .ToDictionary(p => p.Id!, p => p.Name);
            var chemicalDict = chemicalElements
                .Where(ce => ce.Id is not null)
                .ToDictionary(ce => ce.Id!, ce => ce.Name);

            var result = moons.Select(moon => new
            {
                moon.Id,
                moon.Name,
                Planet = moon.PlanetId != null && planetDict.ContainsKey(moon.PlanetId)
                    ? planetDict[moon.PlanetId]
                    : "Unknown",
                moon.Mass,
                moon.Diameter,
                moon.RotationPeriod,
                moon.OrbitalPeriod,
                moon.OrbitalEccentricity,
                moon.OrbitalInclination,
                moon.SemiMajorAxis,
                moon.DistanceFromPlanet,
                moon.SurfaceTemperature,
                DiscoveryDate = moon.DiscoveryDate.ToString("yyyy-MM-dd"),
                Composition = moon.Composition?.Select(c => new
                {
                    Name = chemicalDict.ContainsKey(c.Id) ? chemicalDict[c.Id] : "Unknown",
                    c.Percentage
                }),
            });
            return result;
        }

        public async Task<MoonModel?> GetByIdAsync(string id)
        {
            var filter = Builders<MoonModel>.Filter.Eq(m => m.Id, id);
            var moon = await _moons.Find(filter).FirstOrDefaultAsync();

            return moon is not null ? moon : null;
        }

        public async Task<bool> CreateAsync(MoonModel model)
        {
            await _moons.InsertOneAsync(model);
            return true;
        }

        public async Task<bool> UpdateAsync(MoonModel model)
        {
            var filter = Builders<MoonModel>.Filter.Eq(m => m.Id, model.Id);
            var updateResult = await _moons.ReplaceOneAsync(filter, model);
            return await Task.FromResult(updateResult.IsAcknowledged && updateResult.ModifiedCount > 0);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var filter = Builders<MoonModel>.Filter.Eq(m => m.Id, id);
            var deleteResult = await _moons.DeleteOneAsync(filter);
            return await Task.FromResult(deleteResult.IsAcknowledged && deleteResult.DeletedCount > 0);
        }

        public async Task<(int inserted, int skipped)> ImportFileAsync(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName).ToLower();
            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();
            List<MoonModel>? items = null;
            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<MoonModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    items = JsonSerializer.Deserialize<List<MoonModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(MoonXmlWrapper));
                    var xmlItems = (MoonXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));

                    items = xmlItems?.Moons.Select(x => new MoonModel
                    {
                        Name = x.Name,
                        PlanetId = x.Planet,
                        Mass = x.Mass,
                        Diameter = x.Diameter,
                        RotationPeriod = x.RotationPeriod,
                        OrbitalPeriod = x.OrbitalPeriod,
                        OrbitalEccentricity = x.OrbitalEccentricity,
                        OrbitalInclination = x.OrbitalInclination,
                        SemiMajorAxis = x.SemiMajorAxis,
                        DistanceFromPlanet = x.DistanceFromPlanet,
                        SurfaceTemperature = x.SurfaceTemperature,
                        DiscoveryDate = x.DiscoveryDate,
                    }).ToList();
                    break;
                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<MoonModel>(file.OpenReadStream());
                    break;
                default:
                    throw new Exception("Unsupported file format. Please upload a CSV, JSON, XML, or Excel file.");
            }

            if (items is null || items.Count == 0) throw new Exception("No valid data found in the uploaded file.");

            var existingMoons = (await (_moons.Find(m => items.Select(i => i.Id).Contains(m.Id)).ToListAsync()))
                .Select(x => x.Name.ToLowerInvariant())
                .ToHashSet();
            var newItems = items.Where(x => !existingMoons.Contains(x.Name.ToLowerInvariant())).ToList();
            if (newItems.Count > 0) await _moons.InsertManyAsync(newItems);

            return (inserted: newItems.Count, skipped: items.Count - newItems.Count);
        }

        public async Task<(byte[] fileBytes, string fileContentType, string fullFileName)> ExportFileAsync(string format)
        {
            var items = await _moons.Find(FilterDefinition<MoonModel>.Empty).ToListAsync();
            if (items == null || !items.Any()) throw new Exception("No moons found to export.");
            format = format.ToLowerInvariant();
            string fileContent = string.Empty;
            string fileContentType = string.Empty;
            string fullFileName = $"moons-{DateTime.Now}.{format}";

            switch (format)
            {
                case "csv":
                    fileContent = _csvServices.ConvertToCsv(items);
                    fileContentType = "text/csv";
                    break;
                case "json":
                    fileContent = JsonSerializer.Serialize(items);
                    fileContentType = "application/json";
                    break;
                case "xml":
                    fileContent = xmlBytes(items);
                    fileContentType = "application/xml";
                    break;
                case "xlsx":
                    var excelBytes = ExcelServices.ConvertToExcel(items);
                    fileContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    return (excelBytes, fileContentType, fullFileName);
                default:
                    throw new Exception("Unsupported export format. Please choose CSV, JSON, XML, or XLSX.");
            }
            byte[] fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
            return (fileBytes, fileContentType, fullFileName);
        }

        private string xmlBytes(List<MoonModel> items)
        {
            var wrapper = new MoonXmlWrapper
            {
                Moons = items.Select(x => new MoonXmlModel
                {
                    Name = x.Name,
                    Planet = x.PlanetId,
                    Mass = x.Mass,
                    Diameter = x.Diameter,
                    RotationPeriod = x.RotationPeriod,
                    OrbitalPeriod = x.OrbitalPeriod,
                    OrbitalEccentricity = x.OrbitalEccentricity,
                    OrbitalInclination = x.OrbitalInclination,
                    SemiMajorAxis = x.SemiMajorAxis,
                    DistanceFromPlanet = x.DistanceFromPlanet,
                    SurfaceTemperature = x.SurfaceTemperature,
                    DiscoveryDate = x.DiscoveryDate
                }).ToList()
            };
            using var stringWriter = new StringWriter();
            var serializer = new XmlSerializer(typeof(MoonXmlWrapper));
            serializer.Serialize(stringWriter, wrapper);
            return stringWriter.ToString();
        }

        private async Task<FilterDefinition<MoonModel>> BuildMoonFilter(MoonQueryParameters parameters)
        {
            var filterBuilder = Builders<MoonModel>.Filter;
            var filter = filterBuilder.Empty;
            if (!string.IsNullOrEmpty(parameters.Name))
            {
                filter &= filterBuilder.Regex(m => m.Name, new MongoDB.Bson.BsonRegularExpression(parameters.Name, "i"));
            }
            if (!string.IsNullOrEmpty(parameters.PlanetId))
            {
                filter &= filterBuilder.Eq(m => m.PlanetId, parameters.PlanetId);
            }
            if (parameters.MinMass.HasValue)
            {
                filter &= filterBuilder.Gte(m => m.Mass, parameters.MinMass.Value);
            }
            if (parameters.MaxMass.HasValue)
            {
                filter &= filterBuilder.Lte(m => m.Mass, parameters.MaxMass.Value);
            }
            if (parameters.MinDiameter.HasValue)
            {
                filter &= filterBuilder.Gte(m => m.Diameter, parameters.MinDiameter.Value);
            }
            if (parameters.MaxDiameter.HasValue)
            {
                filter &= filterBuilder.Lte(m => m.Diameter, parameters.MaxDiameter.Value);
            }
            if (parameters.MinSurfaceTemperature.HasValue)
            {
                filter &= filterBuilder.Gte(m => m.SurfaceTemperature, parameters.MinSurfaceTemperature.Value);
            }
            if (parameters.MaxSurfaceTemperature.HasValue)
            {
                filter &= filterBuilder.Lte(m => m.SurfaceTemperature, parameters.MaxSurfaceTemperature.Value);
            }
            if (parameters.MinOrbitalPeriod.HasValue)
            {
                filter &= filterBuilder.Gte(m => m.OrbitalPeriod, parameters.MinOrbitalPeriod.Value);
            }
            if (parameters.MaxOrbitalPeriod.HasValue)
            {
                filter &= filterBuilder.Lte(m => m.OrbitalPeriod, parameters.MaxOrbitalPeriod.Value);
            }
            return filter;
        }

    }
}
