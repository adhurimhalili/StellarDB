using System.Text.Json;
using System.Xml.Serialization;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.StarLuminosityClasses;
using StellarDB.Models.StarSpectralClasses;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StarLuminosityClassesController : ControllerBase
    {
        private readonly IMongoCollection<StarLuminosityClassesModel>? _starLuminosityClasses;
        private readonly CsvServices _csvServices;
        public StarLuminosityClassesController(MongoDbService mongoDbService,
                                                 CsvServices csvServices)
        {
            _starLuminosityClasses = mongoDbService.Database.GetCollection<StarLuminosityClassesModel>("StarLuminosityClasses");
            _csvServices = csvServices;
        }

        [HttpGet]
        public async Task<IEnumerable<StarLuminosityClassesModel>> Get()
        {
            return await _starLuminosityClasses.Find(FilterDefinition<StarLuminosityClassesModel>.Empty)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StarLuminosityClassesModel?>> GetById(string id)
        {
            var filter = Builders<StarLuminosityClassesModel>.Filter.Eq(stBody => stBody.Id, id);
            var starLuminosityClass = _starLuminosityClasses.Find(filter).FirstOrDefault();

            return starLuminosityClass is not null ? Ok(starLuminosityClass) : NotFound("Failed to find Star Luminosity Class.");
        }

        [HttpPost]
        public async Task<ActionResult> Create(StarLuminosityClassesModel starLuminosityClass)
        {
            await _starLuminosityClasses.InsertOneAsync(starLuminosityClass);

            return CreatedAtAction(nameof(GetById), new { id = starLuminosityClass.Id }, starLuminosityClass);
        }

        [HttpPut]
        public async Task<ActionResult> Update(StarLuminosityClassesModel starLuminosityClass)
        {
            var filter = Builders<StarLuminosityClassesModel>.Filter.Eq(x => x.Id, starLuminosityClass.Id);
            var result = await _starLuminosityClasses.ReplaceOneAsync(filter, starLuminosityClass);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Star Luminosity Class.");

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<StarLuminosityClassesModel>.Filter.Eq(x => x.Id, id);
            var result = await _starLuminosityClasses.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Star Luminosity Class.");
            return NoContent();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportFile(IFormFile file)
        {
            if (file is null || file.Length == 0) return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLower();

            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();

            List<StarLuminosityClassesModel>? items = null;

            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<StarLuminosityClassesModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    items = JsonSerializer.Deserialize<List<StarLuminosityClassesModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(StarLuminosityClassesXmlWrapper));
                    var xmlItems = (StarLuminosityClassesXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));

                    items = xmlItems?.Items.Select(x => new StarLuminosityClassesModel
                    {
                        Code = x.Code,
                        Name = x.Name,
                        Description = x.Description,
                    }).ToList();
                    break;
                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<StarLuminosityClassesModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest(new { error = "Unsupported export format. Supported formats: json, csv, xml, xlsx." });
            }

            if (items == null || items.Any(x => string.IsNullOrWhiteSpace(x.Code)))
                return BadRequest(new { error = "One or more entries are missing a 'Code' value." });

            var existingNames = (await _starLuminosityClasses
                .Find(_ => true)  // This fetches all documents
                .ToListAsync())
                .Select(x => x.Code)
                .ToHashSet();

            var newItems = items.Where(x => !existingNames.Contains(x.Code)).ToList();

            if (newItems.Count > 0)
                await _starLuminosityClasses.InsertManyAsync(newItems);

            return Ok(new
            {
                inserted = newItems.Count,
                skipped = items.Count - newItems.Count
            });
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportFile(string format)
        {
            var items = await _starLuminosityClasses.Find(FilterDefinition<StarLuminosityClassesModel>.Empty)
                .ToListAsync();
            if (items == null || !items.Any()) return NotFound("No data available for export.");

            format = format.ToLowerInvariant();
            string fileBytes = null;
            string fullFileName = $"star-luminosity-classes-{DateTime.Now}.{format}";
            switch (format)
            {
                case "json":
                    fileBytes = JsonSerializer.Serialize(items, new JsonSerializerOptions { WriteIndented = true });
                    break;
                case "csv":
                    fileBytes = _csvServices.ConvertToCsv(items);
                    break;
                case "xml":
                    fileBytes = XmlBytes(items);
                    break;
                case "xlsx":
                    var excelBytes = ExcelServices.ConvertToExcel(items);
                    return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{fullFileName}");
                default:
                    return BadRequest(new { error = "Unsupported export format. Supported formats: json, csv, xml, xlsx." });
            }

            return File(System.Text.Encoding.UTF8.GetBytes(fileBytes), $"application/{format}", $"{fullFileName}");
        }

        private static string XmlBytes(List<StarLuminosityClassesModel> starLuminosityClasses)
        {
            var xmlWrapper = new StarLuminosityClassesXmlWrapper
            {
                Items = starLuminosityClasses.Select(x => new StarLuminosityClassesXmlModel
                {
                    Code = x.Code,
                    Name = x.Name,
                    Description = x.Description
                }).ToList()
            };
            using var stringWriter = new StringWriter();
            var serializer = new XmlSerializer(typeof(StarLuminosityClassesXmlWrapper));
            serializer.Serialize(stringWriter, xmlWrapper);

            return stringWriter.ToString();
        }
    }
}

