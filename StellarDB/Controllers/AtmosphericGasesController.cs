using System.Text.Json;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.AtmosphericGases;
using StellarDB.Services;
using Microsoft.AspNetCore.Authorization;

namespace StellarDB.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AtmosphericGasesController : ControllerBase
    {
        private readonly IMongoCollection<AtmosphericGasesModel>? _atmosphericGases;
        private readonly CsvServices _csvServices;
        public AtmosphericGasesController(MongoDbService mongoDbService,
                                             CsvServices csvServices)
        {
            _atmosphericGases = mongoDbService.Database.GetCollection<AtmosphericGasesModel>("AtmosphericGases");
            _csvServices = csvServices;
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet]
        public async Task<IEnumerable<AtmosphericGasesModel>> Get()
        {
            return await _atmosphericGases.Find(FilterDefinition<AtmosphericGasesModel>.Empty).ToListAsync();
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("{id}")]
        public async Task<ActionResult<AtmosphericGasesModel?>> GetById(string id)
        {
            var gas = await _atmosphericGases.Find(g => g.Id == id).FirstOrDefaultAsync();
            if (gas == null) return NotFound();
            return gas;
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost]
        public async Task<ActionResult> Create(AtmosphericGasesModel gas)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _atmosphericGases.InsertOneAsync(gas);
            return CreatedAtAction(nameof(GetById), new { id = gas.Id }, gas);
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPut]
        public async Task<ActionResult> Update(AtmosphericGasesModel gas)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var filter = Builders<AtmosphericGasesModel>.Filter.Eq(g => g.Id, gas.Id);
            var result = await _atmosphericGases.ReplaceOneAsync(filter, gas);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Gas.");
            return Ok(result);
        }

        [Authorize(Policy = "DeleteAccess")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<AtmosphericGasesModel>.Filter.Eq(g => g.Id, id);
            var result = await _atmosphericGases.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Gas.");
            return NoContent();
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost("import")]
        public async Task<IActionResult> Import(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File cannot be null or empty.");
            var extension = Path.GetExtension(file.FileName).ToLower();
            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();
            List<AtmosphericGasesModel> items;

            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<AtmosphericGasesModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    items = JsonSerializer.Deserialize<List<AtmosphericGasesModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(AtmosphericGasesXmlWrapper));
                    var xmlItems = JsonSerializer.Deserialize<AtmosphericGasesXmlWrapper>(fileContent);

                    items = xmlItems?.Items.Select(x => new AtmosphericGasesModel
                    {
                        Name = x.Name,
                        Formula = x.Formula,
                        MolecularWeight = x.MolecularWeight,
                        Density = x.Density,
                        BoilingPoint = x.BoilingPoint,
                        MeltingPoint = x.MeltingPoint,
                        DiscoveryYear = x.DiscoveryYear,
                        Description = x.Description
                    }).ToList() ?? new List<AtmosphericGasesModel>();
                    break;
                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<AtmosphericGasesModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest("Unsupported file format. Please use csv, json or xml.");
            }
            if (items == null || !items.Any()) return BadRequest("No valid data found in the file.");
            var existingItems = (await _atmosphericGases.Find(FilterDefinition<AtmosphericGasesModel>.Empty).ToListAsync())
                .Select(e => e.Name.ToLowerInvariant()).ToHashSet();
            var newItems = items.Where(i => !existingItems.Contains(i.Name.ToLowerInvariant())).ToList();

            if (newItems.Count > 0) await _atmosphericGases.InsertManyAsync(newItems);
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
            var items = await _atmosphericGases.Find(FilterDefinition<AtmosphericGasesModel>.Empty).ToListAsync();
            if (items == null || !items.Any()) return NotFound("No atmospheric gases found.");

            format = format.ToLowerInvariant();
            string fileContent = string.Empty;
            string fileContentType = string.Empty;
            string fullFileName = $"atmospheric-gases-{DateTime.Now}.{format}";

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
                    return BadRequest("Unsupported format. Please use csv, json, xml or xlsx.");
            }
            byte[] fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
            return File(fileBytes, fileContentType, fullFileName);
        }

        private string xmlBytes(List<AtmosphericGasesModel> gasItems)
        {
            var xmlWrapper = new AtmosphericGasesXmlWrapper
            {
                Items = gasItems.Select(g => new AtmosphericGasesXmlModel
                {
                    Name = g.Name,
                    Formula = g.Formula,
                    MolecularWeight = g.MolecularWeight,
                    Density = g.Density,
                    BoilingPoint = g.BoilingPoint,
                    MeltingPoint = g.MeltingPoint,
                    DiscoveryYear = g.DiscoveryYear,
                    Description = g.Description
                }).ToList()
            };
            using var stringWriter = new StringWriter();
            var serializer = new XmlSerializer(typeof(AtmosphericGasesXmlWrapper));
            serializer.Serialize(stringWriter, xmlWrapper);
            return stringWriter.ToString();
        }
    }
}
