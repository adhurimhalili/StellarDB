using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.ChemicalElements;
using StellarDB.Models.Planet;
using StellarDB.Models.Star;
using StellarDB.Models.StarLuminosityClasses;
using StellarDB.Models.StarSpectralClasses;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class StarController : ControllerBase
    {
        private readonly IMongoCollection<StarModel>? _stars;
        private readonly IMongoCollection<StarSpectralClassesModel>? _spectralClasses;
        private readonly IMongoCollection<StarLuminosityClassesModel>? _luminosityClasses;
        private readonly IMongoCollection<ChemicalElementsModel>? _chemicalElements;
        private readonly IMongoCollection<PlanetModel>? _planets;
        private readonly CsvServices _csvServices;
        public StarController(MongoDbService mongoDbService,
                                 CsvServices csvServices)
        {
            _stars = mongoDbService.Database.GetCollection<StarModel>("Stars");
            _spectralClasses = mongoDbService.Database.GetCollection<StarSpectralClassesModel>("StarSpectralClasses");
            _luminosityClasses = mongoDbService.Database.GetCollection<StarLuminosityClassesModel>("StarLuminosityClasses");
            _chemicalElements = mongoDbService.Database.GetCollection<ChemicalElementsModel>("ChemicalElements");
            _planets = mongoDbService.Database.GetCollection<PlanetModel>("Planets");
            _csvServices = csvServices;
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet]
        public async Task<object[]> Get([FromQuery] StarQueryParameters parameters)
        {
            var filter = BuildStarFilter(parameters);

            var stars = await _stars.Find(filter).ToListAsync();
            var spectralClasses = await _spectralClasses.Find(FilterDefinition<StarSpectralClassesModel>.Empty).ToListAsync();
            var luminosityClasses = await _luminosityClasses.Find(FilterDefinition<StarLuminosityClassesModel>.Empty).ToListAsync();
            var chemicalElements = await _chemicalElements.Find(FilterDefinition<ChemicalElementsModel>.Empty).ToListAsync();
            var spectralClassDict = spectralClasses.ToDictionary(sc => sc.Id, sc => sc.Code);
            var luminosityClassDict = luminosityClasses.ToDictionary(lc => lc.Id, lc => lc.Code);
            var compositionDict = chemicalElements.ToDictionary(ch => ch.Id, ch => ch.Name);

            var result = await Task.WhenAll(stars.Select(async star => new
            {
                star.Id,
                star.Name,
                SpectralClassCode = spectralClassDict.ContainsKey(star.SpectralClassId) ? spectralClassDict[star.SpectralClassId] : "Unknown",
                LuminosityClassCode = luminosityClassDict.ContainsKey(star.LuminosityClassId) ? luminosityClassDict[star.LuminosityClassId] : "Unknown",
                star.Magnitude,
                star.Distance,
                star.Diameter,
                star.Mass,
                Temperature = star.Temperature.ToString("N0"),
                DiscoveryDate = star.DiscoveryDate.ToString("yyyy-MM-dd"),
                Composition = star.Composition?.Select(c => new
                {
                    Name = compositionDict.ContainsKey(c.Id) ? compositionDict[c.Id] : "Unknown",
                    c.Percentage
                }),
                star.Description,
                Planets = await GetPlanetNamesByStarIdAsync(star.Id)
            }));

            return result;
        }

        private async Task<IEnumerable<string>> GetPlanetNamesByStarIdAsync(string? id)
        {
            // 1. Check if id is null or empty, return empty list if so.
            if (string.IsNullOrWhiteSpace(id))
                return Enumerable.Empty<string>();

            // 2. Query for planets where Planet.StarId == id.
            var filter = Builders<PlanetModel>.Filter.Eq(p => p.StarId, id);
            var planets = await _planets.Find(filter).ToListAsync();

            // 3. Select and return the planet names as a list.
            return planets.Select(p => p.Name);
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("{id}")]
        public async Task<ActionResult<StarModel?>> GetById(string id)
        {
            var filter = Builders<StarModel>.Filter.Eq(star => star.Id, id);
            var star = _stars.Find(filter).FirstOrDefault();

            return star is not null ? Ok(star) : NotFound("Failed to find Star.");
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost]
        public async Task<ActionResult<StarModel>> Create(StarModel star)
        {
            await _stars.InsertOneAsync(star);
            return CreatedAtAction(nameof(GetById), new { id = star.Id }, star);
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPut]
        public async Task<ActionResult> Update(StarModel star)
        {
            var filter = Builders<StarModel>.Filter.Eq(x => x.Id, star.Id);
            var result = await _stars.ReplaceOneAsync(filter, star);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Star.");

            return Ok(result);
        }

        [Authorize(Policy = "DeleteAccess")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<StarModel>.Filter.Eq(x => x.Id, id);
            var result = await _stars.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Star.");

            return Ok(result);
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost("import")]
        public async Task<IActionResult> ImportFile(IFormFile file)
        {
            if (file is null || file.Length == 0) return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLower();

            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();

            List<StarModel>? items = null;

            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<StarModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    items = JsonSerializer.Deserialize<List<StarModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(StarXmlWrapper));
                    var xmlItems = (StarXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));

                    items = xmlItems?.Items.Select(x => new StarModel
                    {
                        Name = x.Name,
                        SpectralClassId = x.SpectralClassId,
                        Magnitude = x.Magnitude,
                        Distance = x.Distance,
                        Diameter = x.Diameter,
                        Mass = x.Mass,
                        Temperature = x.Temperature,
                        DiscoveryDate = x.DiscoveryDate
                    }).ToList();
                    break;
                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<StarModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest("Unsupported file format. Please upload a CSV, JSON, XML, or Excel file.");
            }

            if (items is null || !items.Any()) return BadRequest("No valid data found in the uploaded file.");

            var existingStars = (await _stars.Find(_stars => true).ToListAsync())
                .Select(x => x.Name.ToLowerInvariant())
                .ToHashSet();

            var newItems = items.Where(x => !existingStars.Contains(x.Name)).ToList();

            if (newItems.Count > 0)
                await _stars.InsertManyAsync(newItems);

            return Ok(new
            {
                inserted = newItems.Count,
                skipped = items.Count - newItems.Count
            });
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("export")]
        public async Task<IActionResult> Export(string format)
        {
            var items = await _stars.Find(FilterDefinition<StarModel>.Empty)
                .ToListAsync();

            if (items == null || !items.Any()) return NotFound("No data available for export.");

            format = format.ToLowerInvariant();
            string fileContent = string.Empty;
            string fileContentType = string.Empty;
            string fullFileName = $"stars-{DateTime.Now}.{format}";
            switch (format)
            {
                case "csv":
                    fileContent = _csvServices.ConvertToCsv(items);
                    fileContentType = "text/csv";
                    break;
                case "json":
                    fileContent = JsonSerializer.Serialize(items, new JsonSerializerOptions { WriteIndented = true });
                    fileContentType = "application/json";
                    break;
                case "xml":
                    fileContent = xmlBytes(items);
                    fileContentType = "application/xml";
                    break;
                case "xlsx":
                    {
                        var excelBytes = ExcelServices.ConvertToExcel(items);
                        fileContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        return File(excelBytes, fileContentType, fullFileName);
                    }
                default:
                    return BadRequest(new { error = "Unsupported export format. Supported formats: json, csv, xml, xlsx." });
            }
            byte[] fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
            return File(fileBytes, fileContentType, fullFileName);
        }

        private string xmlBytes(List<StarModel> starItems)
        {
            var xmlWrapper = new StarXmlWrapper
            {
                Items = starItems.Select(x => new StarXmlModel
                {
                    Name = x.Name,
                    SpectralClassId = x.SpectralClassId,
                    Magnitude = x.Magnitude,
                    Distance = x.Distance,
                    Diameter = x.Diameter,
                    Mass = x.Mass,
                    Temperature = x.Temperature,
                    DiscoveryDate = x.DiscoveryDate
                }).ToList()
            };
            using var stringWriter = new StringWriter();
            var serializer = new XmlSerializer(typeof(StarSpectralClassesXmlWrapper));
            serializer.Serialize(stringWriter, xmlWrapper);

            return stringWriter.ToString();
        }

        private static FilterDefinition<StarModel> BuildStarFilter(StarQueryParameters parameters)
        {
            var filterBuilder = Builders<StarModel>.Filter;
            var filters = new List<FilterDefinition<StarModel>>();

            if (!string.IsNullOrWhiteSpace(parameters.Name))
                filters.Add(filterBuilder.Regex(x => x.Name, new MongoDB.Bson.BsonRegularExpression(parameters.Name, "i")));

            if (!string.IsNullOrWhiteSpace(parameters.SpectralClassId))
                filters.Add(filterBuilder.Eq(x => x.SpectralClassId, parameters.SpectralClassId));

            if (!string.IsNullOrWhiteSpace(parameters.LuminosityClassId))
                filters.Add(filterBuilder.Eq(x => x.LuminosityClassId, parameters.LuminosityClassId));

            if (parameters.MinMagnitude.HasValue)
                filters.Add(filterBuilder.Gte(x => x.Magnitude, parameters.MinMagnitude.Value));

            if (parameters.MaxMagnitude.HasValue)
                filters.Add(filterBuilder.Lte(x => x.Magnitude, parameters.MaxMagnitude.Value));

            if (parameters.MinDistance.HasValue)
                filters.Add(filterBuilder.Gte(x => x.Distance, parameters.MinDistance.Value));

            if (parameters.MaxDistance.HasValue)
                filters.Add(filterBuilder.Lte(x => x.Distance, parameters.MaxDistance.Value));

            if (parameters.MinMass.HasValue)
                filters.Add(filterBuilder.Gte(x => x.Mass, parameters.MinMass.Value));

            if (parameters.MaxMass.HasValue)
                filters.Add(filterBuilder.Lte(x => x.Mass, parameters.MaxMass.Value));

            if (parameters.MinDiameter.HasValue)
                filters.Add(filterBuilder.Gte(x => x.Diameter, parameters.MinDiameter.Value));

            if (parameters.MaxDiameter.HasValue)
                filters.Add(filterBuilder.Lte(x => x.Diameter, parameters.MaxDiameter.Value));

            if (parameters.MinTemperature.HasValue)
                filters.Add(filterBuilder.Gte(x => x.Temperature, parameters.MinTemperature.Value));

            if (parameters.MaxTemperature.HasValue)
                filters.Add(filterBuilder.Lte(x => x.Temperature, parameters.MaxTemperature.Value));

            if (parameters.From.HasValue)
                filters.Add(filterBuilder.Gte(x => x.DiscoveryDate, parameters.From.Value));

            if (parameters.To.HasValue)
                filters.Add(filterBuilder.Lte(x => x.DiscoveryDate, parameters.To.Value));

            return filters.Count > 0 ? filterBuilder.And(filters) : filterBuilder.Empty;
        }
    }
}
