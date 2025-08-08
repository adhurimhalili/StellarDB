using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.Star;
using StellarDB.Models.StarLuminosityClasses;
using StellarDB.Models.StarSpectralClasses;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StarController : ControllerBase
    {
        private readonly IMongoCollection<StarModel>? _stars;
        private readonly IMongoCollection<StarSpectralClassesModel>? _spectralClasses;
        private readonly IMongoCollection<StarLuminosityClassesModel>? _luminosityClasses;
        private readonly CsvServices _csvServices;
        public StarController(MongoDbService mongoDbService,
                                 CsvServices csvServices)
        {
            _stars = mongoDbService.Database.GetCollection<StarModel>("Stars");
            _spectralClasses = mongoDbService.Database.GetCollection<StarSpectralClassesModel>("StarSpectralClasses");
            _luminosityClasses = mongoDbService.Database.GetCollection<StarLuminosityClassesModel>("StarLuminosityClasses");
            _csvServices = csvServices;
        }

        [HttpGet]
        public async Task<IEnumerable<object>> Get()
        {
            var stars = await _stars.Find(FilterDefinition<StarModel>.Empty).ToListAsync();
            var spectralClasses = await _spectralClasses.Find(FilterDefinition<StarSpectralClassesModel>.Empty).ToListAsync();
            var luminosityClasses = await _luminosityClasses.Find(FilterDefinition<StarLuminosityClassesModel>.Empty).ToListAsync();
            var spectralClassDict = spectralClasses.ToDictionary(c => c.Id, c => c.Code);
            var luminosityClassDict = luminosityClasses.ToDictionary(lc => lc.Id, lc => lc.Code);

            var result = stars.Select(star => new
            {
                star.Id,
                star.Name,
                SpectralClassCode = spectralClassDict.ContainsKey(star.SpectralClassId) ? spectralClassDict[star.SpectralClassId] : "Unknown",
                LuminosityClassCode = luminosityClassDict.ContainsKey(star.LuminosityClassId) ? luminosityClassDict[star.LuminosityClassId] : "Unknown",
                star.Magnitude,
                star.Distance,
                star.Diameter,
                star.Mass,
                star.Temperature,
                star.DiscoveryDate
            });

            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StarModel?>> GetById(string id)
        {
            var filter = Builders<StarModel>.Filter.Eq(star => star.Id, id);
            var star = _stars.Find(filter).FirstOrDefault();

            return star is not null ? Ok(star) : NotFound("Failed to find Star.");
        }

        [HttpPost]
        public async Task<ActionResult<StarModel>> Create(StarModel star)
        {
            await _stars.InsertOneAsync(star);
            return CreatedAtAction(nameof(GetById), new { id = star.Id }, star);
        }

        [HttpPut]
        public async Task<ActionResult> Update(StarModel star)
        {
            var filter = Builders<StarModel>.Filter.Eq(x => x.Id, star.Id);
            var result = await _stars.ReplaceOneAsync(filter, star);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Star.");

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<StarModel>.Filter.Eq(x => x.Id, id);
            var result = await _stars.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Star.");

            return Ok(result);
        }

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
                        return File(excelBytes, fileContent, fullFileName);
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
    }
}
