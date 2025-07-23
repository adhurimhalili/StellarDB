using System.Text.Json;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.StellarObjectTypes;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StellarObjectTypesController : ControllerBase
    {
        private readonly IMongoCollection<StellarObjectTypesModel>? _stellarObjectTypes;
        private readonly CsvServices _csvServices;
        private readonly ExcelServices _excelServices;
        public StellarObjectTypesController(MongoDbService mongoDbService,
                                            CsvServices csvServices,
                                            ExcelServices excelServices)
        {
            _stellarObjectTypes = mongoDbService.Database.GetCollection<StellarObjectTypesModel>("StellarObjectTypes");
            _csvServices = csvServices;
            _excelServices = excelServices;
        }

        [HttpGet]
        public async Task<IEnumerable<StellarObjectTypesModel>> Get()
        {
            return await _stellarObjectTypes.Find(FilterDefinition<StellarObjectTypesModel>.Empty)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StellarObjectTypesModel?>> GetById(string id)
        {
            var filter = Builders<StellarObjectTypesModel>.Filter.Eq(stBody => stBody.Id, id);
            var stellarObjectType = _stellarObjectTypes.Find(filter).FirstOrDefault();

            return stellarObjectType is not null ? Ok(stellarObjectType) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> Create(StellarObjectTypesModel stellarObjectType)
        {
            await _stellarObjectTypes.InsertOneAsync(stellarObjectType);
            return CreatedAtAction(nameof(GetById), new { id = stellarObjectType.Id }, stellarObjectType);
        }

        [HttpPut]
        public async Task<ActionResult> Update(StellarObjectTypesModel stellarObjectType)
        {
            var filter = Builders<StellarObjectTypesModel>.Filter.Eq(x => x.Id, stellarObjectType.Id);

            //var update = Builders<StellarObjectTypesModel>.Update
            //    .Set(x => x.Name, stellarObjectType.Name)
            //    .Set(x => x.Description, stellarObjectType.Description);
            //await _stellarObjectTypes.UpdateOneAsync(filter, update);

            await _stellarObjectTypes.ReplaceOneAsync(filter, stellarObjectType);
            return Ok(stellarObjectType);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<StellarObjectTypesModel>.Filter.Eq(stBody => stBody.Id, id);

            await _stellarObjectTypes.DeleteOneAsync(filter);
            return Ok();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportFile(IFormFile file)
        {
            if (file is null || file.Length == 0) return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLower();

            using var stream = new StreamReader(file.OpenReadStream());
            var fileContent = await stream.ReadToEndAsync();

            List<StellarObjectTypesModel>? items = null;
            switch (extension)
            {
                case ".csv":
                    items = await _csvServices.ParseCsvAsync<StellarObjectTypesModel>(file.OpenReadStream());
                    break;
                case ".json":
                    items = JsonSerializer.Deserialize<List<StellarObjectTypesModel>>(fileContent);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(StellarObjectTypesXmlWrapper));
                    var xmlItems = (StellarObjectTypesXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));

                    items = xmlItems?.Items.Select(x => new StellarObjectTypesModel
                    {
                        Name = x.Name,
                        Description = x.Description
                    }).ToList();
                    break;

                case ".xls":
                case ".xlsx":
                case "xlsm":
                case ".xlsb":
                    items = ExcelServices.ParseExcel<StellarObjectTypesModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest(new { error = "Unsupported file format." });
            }

            if (items == null || items.Any(x => string.IsNullOrWhiteSpace(x.Name)))
                return BadRequest(new { error = "One or more entries are missing a 'Name' value." });

            var existingNames = (await _stellarObjectTypes
                .Find(_ => true)  // This fetches all documents
                .ToListAsync())
                .Select(x => x.Name)
                .ToHashSet();

            var newItems = items.Where(x => !existingNames.Contains(x.Name)).ToList();

            if (newItems.Count > 0)
                await _stellarObjectTypes.InsertManyAsync(newItems);

            return Ok(new
            {
                inserted = newItems.Count,
                skipped = items.Count - newItems.Count
            });
        }

        [HttpGet("export/{fileType}")]
        public async Task<IActionResult> ExportFile (string fileType)
        {
            return BadRequest(new { error = "Export functionality is not implemented yet." });
        }
    }
}
