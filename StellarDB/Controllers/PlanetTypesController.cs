using System.Text.Json;
using System.Xml.Serialization;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.PlanetTypes;
using StellarDB.Models.StarSpectralClasses;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PlanetTypesController : ControllerBase
    {
        private readonly IMongoCollection<PlanetTypesModel>? _planetTypes;
        private readonly CsvServices _csvServices;

        public PlanetTypesController(MongoDbService mongoDbService,
                                     CsvServices csvServices)
        {
            _planetTypes = mongoDbService.Database.GetCollection<PlanetTypesModel>("PlanetTypes");
            _csvServices = csvServices;
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet]
        public async Task<IEnumerable<PlanetTypesModel>> Get()
        {
            return await _planetTypes.Find(FilterDefinition<PlanetTypesModel>.Empty).ToListAsync();
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("{id}")]
        public async Task<ActionResult<PlanetTypesModel?>> GetById(string id)
        {
            var filter = Builders<PlanetTypesModel>.Filter.Eq(pt => pt.Id, id);
            var planetType = _planetTypes.Find(filter).FirstOrDefault();
            return planetType is not null ? Ok(planetType) : NotFound("Failed to find Planet Type.");
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost]
        public async Task<ActionResult> Create(PlanetTypesModel planetType)
        {
            await _planetTypes.InsertOneAsync(planetType);
            return CreatedAtAction(nameof(GetById), new { id = planetType.Id }, planetType);
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPut]
        public async Task<ActionResult> Update(PlanetTypesModel planetType)
        {
            var filter = Builders<PlanetTypesModel>.Filter.Eq(x => x.Id, planetType.Id);
            var result = await _planetTypes.ReplaceOneAsync(filter, planetType);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Planet Type.");

            return Ok(result);
        }

        [Authorize(Policy = "DeleteAccess")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<PlanetTypesModel>.Filter.Eq(x => x.Id, id);
            var result = await _planetTypes.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Planet Type.");

            return NoContent();
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost("import")]
        public async Task<IActionResult> ImportFile(IFormFile file)
        {
            if (file is null || file.Length == 0) return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLower();

            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();

            List<PlanetTypesModel>? items = null;

            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<PlanetTypesModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    items = JsonSerializer.Deserialize<List<PlanetTypesModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(PlanetTypesXmlWrapper));
                    var xmlItems = (PlanetTypesXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));

                    items = xmlItems?.Items.Select(x => new PlanetTypesModel
                    {
                        Name = x.Name,
                        Description = x.Description
                    }).ToList();
                    break;
                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<PlanetTypesModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest("Unsupported file format.");
            }

            if (items == null || items.Any(x => string.IsNullOrWhiteSpace(x.Name)))
                return BadRequest(new { error = "One or more entries are missing a 'Name' value." });

            var existingNames = (await _planetTypes.Find(_ => true).ToListAsync())
                .Select(x => x.Name)
                .ToHashSet();

            var newItems = items.Where(x => !existingNames.Contains(x.Name)).ToList();

            if (newItems.Count > 0)
                await _planetTypes.InsertManyAsync(newItems);

            return Ok(new
            {
                inserted = newItems.Count,
                skipped = items.Count - newItems.Count
            });
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("export")]
        public async Task<IActionResult> ExportFile(string format)
        {
            var planetItems = await _planetTypes.Find(FilterDefinition<PlanetTypesModel>.Empty).ToListAsync();
            if (!planetItems.Any()) return NotFound("No Planet Types found.");

            format = format.ToLowerInvariant();
            string content;
            string contentType;
            string fullFileName = $"star-spectral-classes-{DateTime.Now}.{format}";

            switch (format.ToLower())
            {
                case "csv":
                    content = _csvServices.ConvertToCsv(planetItems);
                    contentType = "text/csv";
                    break;
                case "json":
                    content = JsonSerializer.Serialize(planetItems, new JsonSerializerOptions { WriteIndented = true });
                    contentType = "application/json";
                    break;
                case "xml":
                    content = XmlBytes(planetItems);
                    contentType = "application/xml";
                    break;
                case "xlsx":
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    var excelBytes = ExcelServices.ConvertToExcel(planetItems);
                    return File(excelBytes, contentType, $"{fullFileName}");
                default:
                    return BadRequest("Unsupported export format. Supported formats: json, csv, xml.");
            }
            return File(System.Text.Encoding.UTF8.GetBytes(content), contentType, $"{fullFileName}");
        }

        private static string XmlBytes(List<PlanetTypesModel> planetItems)
        {
            var xmlWrapper = new PlanetTypesXmlWrapper
            {
                Items = planetItems.Select(x => new PlanetTypesXmlModel
                {
                    Name = x.Name,
                    Description = x.Description
                }).ToList()
            };
            var serializer = new XmlSerializer(typeof(PlanetTypesXmlWrapper));
            using var stringWriter = new StringWriter();
            serializer.Serialize(stringWriter, xmlWrapper);

            return stringWriter.ToString();
        }
    }
}
