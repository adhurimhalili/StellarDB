using System.Text.Json;
using System.Xml.Serialization;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.AtmosphericGases;
using StellarDB.Models.ChemicalElements;
using StellarDB.Models.Planet;
using StellarDB.Models.PlanetTypes;
using StellarDB.Models.Star;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlanetController : ControllerBase
    {
        private readonly IMongoCollection<PlanetModel>? _planets;
        private readonly IMongoCollection<PlanetTypesModel>? _planetTypes;
        private readonly IMongoCollection<ChemicalElementsModel>? _chemicalElements;
        private readonly IMongoCollection<AtmosphericGasesModel>? _atmosphereElements;
        private readonly IMongoCollection<StarModel>? _stars;
        private readonly CsvServices _csvServices;
        public PlanetController(MongoDbService mongoDbService,
                                CsvServices csvServices)
        {
            _planets = mongoDbService.Database.GetCollection<PlanetModel>("Planets");
            _planetTypes = mongoDbService.Database.GetCollection<PlanetTypesModel>("PlanetTypes");
            _chemicalElements = mongoDbService.Database.GetCollection<ChemicalElementsModel>("ChemicalElements");
            _atmosphereElements = mongoDbService.Database.GetCollection<AtmosphericGasesModel>("AtmosphericGases");
            _stars = mongoDbService.Database.GetCollection<StarModel>("Stars");
            _csvServices = csvServices;
        }

        [HttpGet]
        public async Task<IEnumerable<object>> Get()
        {
            var planets = await _planets.Find(FilterDefinition<PlanetModel>.Empty).ToListAsync();
            var planetTypes = await _planetTypes.Find(FilterDefinition<PlanetTypesModel>.Empty).ToListAsync();
            var planetTypeDict = planetTypes.ToDictionary(pt => pt.Id, pt => pt.Name);
            var stars = await _stars.Find(FilterDefinition<StarModel>.Empty).ToListAsync();
            var starDict = stars.ToDictionary(s => s.Id, s => s.Name);
            var result = planets.Select(planet => new
            {
                planet.Id,
                planet.Name,
                PlanetTypeName = planetTypeDict.ContainsKey(planet.PlanetTypeId) ? planetTypeDict[planet.PlanetTypeId] : "Unknown",
                planet.Mass,
                planet.Diameter,
                planet.RotationPeriod,
                planet.OrbitalPeriod,
                planet.OrbitalEccentricity,
                planet.OrbitalInclination,
                planet.SemiMajorAxis,
                planet.DistanceFromStar,
                planet.SurfaceTemperature,
                DiscoveryDate = planet.DiscoveryDate.ToString("yyyy-MM-dd"),
                StarName = planet.StarId != null && starDict.ContainsKey(planet.StarId) ? starDict[planet.StarId] : "Unknown",
                planet.Description
            });
            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlanetModel?>> GetById(string id)
        {
            var filter = Builders<PlanetModel>.Filter.Eq(p => p.Id, id);
            var planet = await _planets.Find(filter).FirstOrDefaultAsync();

            return planet is not null ? Ok(planet) : NotFound("Failed to find Planet.");
        }

        [HttpPost]
        public async Task<ActionResult<PlanetModel>> Create(PlanetModel planet)
        {
            await _planets.InsertOneAsync(planet);
            return CreatedAtAction(nameof(GetById), new { id = planet.Id }, planet);
        }

        [HttpPut]
        public async Task<ActionResult<PlanetModel>> Update(PlanetModel planet)
        {
            var filter = Builders<PlanetModel>.Filter.Eq(p => p.Id, planet.Id);
            var result = await _planets.ReplaceOneAsync(filter, planet);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Star.");
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<PlanetModel>.Filter.Eq(p => p.Id, id);
            var result = await _planets.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Planet.");
            return NoContent();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportFile(IFormFile file)
        {
            if (file is null || file.Length == 0) return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLower();

            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();

            List<PlanetModel>? items = null;
            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<PlanetModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    items = JsonSerializer.Deserialize<List<PlanetModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(PlanetXmlWrapper));
                    var xmlItems = (PlanetXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));

                    items = xmlItems?.Items.Select(x => new PlanetModel
                    {
                        Name = x.Name,
                        PlanetTypeId = x.PlanetTypeId ?? string.Empty,
                        Mass = x.Mass,
                        Diameter = x.Diameter,
                        RotationPeriod = x.RotationPeriod,
                        OrbitalPeriod = x.OrbitalPeriod,
                        OrbitalEccentricity = x.OrbitalEccentricity,
                        OrbitalInclination = x.OrbitalInclination,
                        SemiMajorAxis = x.SemiMajorAxis,
                        DistanceFromStar = x.DistanceFromStar,
                        SurfaceTemperature = x.SurfaceTemperature,
                        DiscoveryDate = x.DiscoveryDate,
                        StarId = x.StarId,
                        Description = x.Description ?? string.Empty
                    }).ToList();
                    break;
                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<PlanetModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest("Unsupported file format. Please upload a CSV, JSON, XML, or Excel file.");
            }

            if (items is null || items.Count == 0) return BadRequest("No valid data found in the uploaded file.");

            var existingPlanets = (await _planets.Find(p => items.Select(i => i.Id).Contains(p.Id)).ToListAsync())
                .Select(x => x.Name.ToLowerInvariant())
                .ToHashSet();

            var newItems = items.Where(x => !existingPlanets.Contains(x.Name.ToLowerInvariant())).ToList();

            if (newItems.Count > 0) await _planets.InsertManyAsync(newItems);

            return Ok(new
            {
                inserted = newItems.Count,
                skipped = items.Count - newItems.Count
            });
        }

        [HttpGet("export")]
        public async Task<IActionResult> Export(string format)
        {
            var items = await _planets.Find(FilterDefinition<PlanetModel>.Empty).ToListAsync();

            if (items == null || !items.Any()) return NotFound("No planets found to export.");

            format = format.ToLowerInvariant();
            string fileContent = string.Empty;
            string fileContentType = string.Empty;
            string fullFileName = $"planets-{DateTime.Now}.{format}";

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
                    return File(excelBytes, fileContentType, fullFileName);
                default:
                    return BadRequest(new { error = "Unsupported export format. Supported formats: json, csv, xml, xlsx." });
            }
            byte[] fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
            return File(fileBytes, fileContentType, fullFileName);
        }

        private string xmlBytes(List<PlanetModel> items)
        {
            var wrapper = new PlanetXmlWrapper
            {
                Items = items.Select(x => new PlanetXmlModel
                {
                    Name = x.Name,
                    PlanetTypeId = x.PlanetTypeId,
                    Mass = x.Mass,
                    Diameter = x.Diameter,
                    RotationPeriod = x.RotationPeriod,
                    OrbitalPeriod = x.OrbitalPeriod,
                    OrbitalEccentricity = x.OrbitalEccentricity,
                    OrbitalInclination = x.OrbitalInclination,
                    SemiMajorAxis = x.SemiMajorAxis,
                    DistanceFromStar = x.DistanceFromStar,
                    SurfaceTemperature = x.SurfaceTemperature,
                    DiscoveryDate = x.DiscoveryDate,
                    StarId = x.StarId,
                    Description = x.Description ?? string.Empty
                }).ToList()
            };
            using var stringWriter = new StringWriter();
            var serializer = new XmlSerializer(typeof(PlanetXmlWrapper));
            serializer.Serialize(stringWriter, wrapper);
            return stringWriter.ToString();
        }
    }
}
