using System.Text.Json;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.StarSpectralClasses;
using StellarDB.Models.StellarObjectTypes;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StarSpectralClassesController : ControllerBase
    {
        private readonly IMongoCollection<StarSpectralClassesModel>? _starSpectralClasses;
        private readonly CsvServices _csvServices;
        private readonly ExcelServices _excelServices;

        public StarSpectralClassesController(MongoDbService mongoDbService,
                                             CsvServices csvServices,
                                             ExcelServices excelServices)
        {
            _starSpectralClasses = mongoDbService.Database.GetCollection<StarSpectralClassesModel>("StarSpectralClasses");
            _csvServices = csvServices;
            _excelServices = excelServices;
        }

        [HttpGet]
        public async Task<IEnumerable<StarSpectralClassesModel>> Get()
        {
            return await _starSpectralClasses.Find(FilterDefinition<StarSpectralClassesModel>.Empty)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StarSpectralClassesModel?>> GetById(string id)
        {
            var filter = Builders<StarSpectralClassesModel>.Filter.Eq(stBody => stBody.Id, id);
            var starSpectralClass = _starSpectralClasses.Find(filter).FirstOrDefault();

            return starSpectralClass is not null ? Ok(starSpectralClass) : NotFound("Failed to find Star Spectral Class.");
        }

        [HttpPost]
        public async Task<ActionResult> Create(StarSpectralClassesModel starSpectralClass)
        {
            await _starSpectralClasses.InsertOneAsync(starSpectralClass);

            return CreatedAtAction(nameof(GetById), new { id = starSpectralClass.Id }, starSpectralClass);
        }

        [HttpPut]
        public async Task<ActionResult> Update(StarSpectralClassesModel starSpectralClass)
        {
            var filter = Builders<StarSpectralClassesModel>.Filter.Eq(x => x.Id, starSpectralClass.Id);
            var result = await _starSpectralClasses.ReplaceOneAsync(filter, starSpectralClass);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Star Spectral Class.");

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<StarSpectralClassesModel>.Filter.Eq(x => x.Id, id);
            var result = await _starSpectralClasses.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Star Spectral Class.");

            return NoContent();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportFile(IFormFile file)
        {
            if (file is null || file.Length == 0) return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLower();

            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();

            List<StarSpectralClassesModel>? items = null;

            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<StarSpectralClassesModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    items = JsonSerializer.Deserialize<List<StarSpectralClassesModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(StarSpectralClassesXmlWrapper));
                    var xmlItems = (StarSpectralClassesXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));

                    items = xmlItems?.Items.Select(x => new StarSpectralClassesModel
                    {
                        Code = x.Code,
                        TemperatureRange = x.TemperatureRange,
                        Color = x.Color,
                        Description = x.Description
                    }).ToList();
                    break;
                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<StarSpectralClassesModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest(new { error = "Unsupported export format. Supported formats: json, csv, xml, xlsx." });
            }

            if (items == null || items.Any(x => string.IsNullOrWhiteSpace(x.Code)))
                return BadRequest(new { error = "One or more entries are missing a 'Code' value." });

            var existingNames = (await _starSpectralClasses.Find(_ => true).ToListAsync())
                .Select(x => x.Code)
                .ToHashSet();

            var newItems = items.Where(x => !existingNames.Contains(x.Code)).ToList();

            if (newItems.Count > 0)
                await _starSpectralClasses.InsertManyAsync(newItems);

            return Ok(new
            {
                inserted = newItems.Count,
                skipped = items.Count - newItems.Count
            });
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportFile(string format)
        {
            var items = await _starSpectralClasses.Find(FilterDefinition<StarSpectralClassesModel>.Empty)
                .ToListAsync();

            if (items == null || !items.Any()) return NotFound("No data available for export.");

            format = format.ToLowerInvariant();
            string fileBytes = null;
            string fullFileName = $"star-spectral-classes-{DateTime.Now}.{format}";
            string contentType;
            switch (format)
            {
                case "csv":
                    fileBytes = _csvServices.ConvertToCsv(items);
                    contentType = "text/csv";
                    break;
                case "json":
                    fileBytes = JsonSerializer.Serialize(items, new JsonSerializerOptions { WriteIndented = true });
                    contentType = "application/json";
                    break;
                case "xml":
                    fileBytes = XmlBytes(items);
                    contentType = "application/xml";
                    break;
                case "xlsx":
                    var excelBytes = ExcelServices.ConvertToExcel(items);
                    return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{fullFileName}");
                default:
                    return BadRequest(new { error = "Unsupported export format. Supported formats: json, csv, xml, xlsx." });
            }

            return File(System.Text.Encoding.UTF8.GetBytes(fileBytes), contentType, $"{fullFileName}");
        }
        private static string XmlBytes(List<StarSpectralClassesModel> stellarItems)
        {
            var xmlWrapper = new StarSpectralClassesXmlWrapper
            {
                Items = stellarItems.Select(x => new StarSpectralClassesXmlModel
                {
                    Code = x.Code,
                    TemperatureRange = x.TemperatureRange,
                    Color = x.Color,
                    Description = x.Description
                }).ToList()
            };
            using var stringWriter = new StringWriter();
            var serializer = new XmlSerializer(typeof(StarSpectralClassesXmlWrapper));
            serializer.Serialize(stringWriter, xmlWrapper);

            return stringWriter.ToString();
        }
    }
}
