using System.Text.Json;
using System.Xml.Serialization;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.ChemicalElements;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChemicalElementsController : ControllerBase
    {
        private readonly IMongoCollection<ChemicalElementsModel>? _chemicalElements;
        private readonly CsvServices _csvServices;
        public ChemicalElementsController   (MongoDbService mongoDbService,
                                             CsvServices csvServices)
        {
            _chemicalElements = mongoDbService.Database.GetCollection<ChemicalElementsModel>("ChemicalElements");
            _csvServices = csvServices;
        }

        [HttpGet]
        public async Task<IEnumerable<ChemicalElementsModel>> Get()
        {
            return await _chemicalElements.Find(FilterDefinition<ChemicalElementsModel>.Empty).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChemicalElementsModel?>> GetById(string id)
        {
            var element = await _chemicalElements.Find(e => e.Id == id).FirstOrDefaultAsync();
            if (element == null) return NotFound();
            return element;
        }

        [HttpPost]
        public async Task<ActionResult> Create(ChemicalElementsModel element)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _chemicalElements.InsertOneAsync(element);
            return CreatedAtAction(nameof(GetById), new { id = element.Id }, element);
        }

        [HttpPut]
        public async Task<ActionResult> Update(string id, ChemicalElementsModel element)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var filter = Builders<ChemicalElementsModel>.Filter.Eq(e => e.Id, id);
            var result = await _chemicalElements.ReplaceOneAsync(filter, element);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Element.");
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<ChemicalElementsModel>.Filter.Eq(e => e.Id, id);
            var result = await _chemicalElements.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Element.");
            return NoContent();
        }

        [HttpPost("import")]
        public async Task<ActionResult> Import(IFormFile file)
        {
            if (file is null || file.Length == 0) return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLower();
            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();
            List<ChemicalElementsModel>? items = null;

            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<ChemicalElementsModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    items = JsonSerializer.Deserialize<List<ChemicalElementsModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(ChemicalElementsXmlWrapper));
                    var xmlItems = (ChemicalElementsXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));

                    items = xmlItems?.Items.Select(x => new ChemicalElementsModel
                    {
                        AtomicNumber = x.AtomicNumber,
                        Symbol = x.Symbol,
                        Name = x.Name,
                        AtomicWeight = x.AtomicWeight,
                        MeltingPoint = x.MeltingPoint,
                        BoilingPoint = x.BoilingPoint,
                        Period = x.Period,
                        Group = x.Group,
                        DiscoveryYear = x.DiscoveryYear
                    }).ToList();
                    break;
                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<ChemicalElementsModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest("Unsupported file format. Please upload a CSV, JSON, XML, or Excel file.");
            }
            if (items == null || !items.Any()) return BadRequest("No valid data found in the uploaded file.");

            var existingElements = (await _chemicalElements.Find(FilterDefinition<ChemicalElementsModel>.Empty).ToListAsync())
                .Select(x => x.Name.ToLowerInvariant())
                .ToHashSet();
            var newElements = items.Where(x => !existingElements.Contains(x.Name.ToLowerInvariant())).ToList();

            if (newElements.Count > 0)
                await _chemicalElements.InsertManyAsync(newElements);

            return Ok(new
            {
                inserted = newElements.Count,
                skipped = items.Count - newElements.Count
            });
        }

        [HttpGet("export")]
        public async Task<IActionResult> Export(string format)
        {
            var items = await _chemicalElements.Find(FilterDefinition<ChemicalElementsModel>.Empty).ToListAsync();

            if (items == null || !items.Any())return NotFound("No chemical elements found.");
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
                    var excelBytes = ExcelServices.ConvertToExcel(items);
                    fileContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    return File(excelBytes, fileContentType, fullFileName);
                default:
                    return BadRequest("Unsupported export format. Please use csv, json, xml, or xlsx.");
            }
            byte[] fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
            return File(fileBytes, fileContentType, fullFileName);
        }

        private string xmlBytes(List<ChemicalElementsModel> elementItems)
        {
            var xmlWrapper = new ChemicalElementsXmlWrapper
            {
                Items = elementItems.Select(e => new ChemicalElementsXmlModel
                {
                    AtomicNumber = e.AtomicNumber,
                    Symbol = e.Symbol,
                    Name = e.Name,
                    AtomicWeight = e.AtomicWeight,
                    MeltingPoint = e.MeltingPoint,
                    BoilingPoint = e.BoilingPoint,
                    Period = e.Period,
                    Group = e.Group,
                    DiscoveryYear = e.DiscoveryYear,
                    Description = e.Description
                }).ToList()
            };
            using var stringWriter = new StringWriter();
            var serializer = new XmlSerializer(typeof(ChemicalElementsXmlWrapper));
            serializer.Serialize(stringWriter, xmlWrapper);
            return stringWriter.ToString();
        }
    }
}
