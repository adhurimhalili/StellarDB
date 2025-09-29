using System.Text.Json;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.Constellations;
using StellarDB.Models.Star;
using StellarDB.Services;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConstellationsController : ControllerBase
    {
        private readonly IMongoCollection<ConstellationsModel> _constellations;
        private readonly IMongoCollection<StarModel> _stars;
        private readonly CsvServices _csvServices;

        public ConstellationsController(MongoDbService mongoDbService,
            CsvServices csvServices)
        {
            _constellations = mongoDbService.Database.GetCollection<ConstellationsModel>("Constellations");
            _stars = mongoDbService.Database.GetCollection<StarModel>("Stars");
            _csvServices = csvServices;
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet]
        public async Task<IEnumerable<ConstellationsViewModel>> Get()
        {
            var constellations = await _constellations.Find(FilterDefinition<ConstellationsModel>.Empty).ToListAsync();

            var starIds = constellations
                .Where(c => c.StarIds != null)
                .SelectMany(c => c.StarIds)
                .Distinct()
                .ToList();

            var starsDict = new Dictionary<string, string>();
            if (starIds.Count > 0)
            {
                var stars = await _stars.Find(s => starIds.Contains(s.Id)).ToListAsync();
                starsDict = stars
                    .Where(s => s.Id != null)
                    .ToDictionary(s => s.Id!, s => s.Name);
            }

            var result = constellations.Select(c => new ConstellationsViewModel
            {
                Id = c.Id ?? string.Empty,
                Name = c.Name,
                Description = c.Description,
                Stars = c.StarIds?.Select(id => starsDict.ContainsKey(id) ? starsDict[id] : id).ToArray() ?? Array.Empty<string>()
            });

            return result;
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("{id}")]
        public async Task<ActionResult<ConstellationsModel>> GetById(string id)
        {
            var constellation = await _constellations.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (constellation == null) return NotFound();
            return constellation;
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost]
        public async Task<ActionResult> Create(ConstellationsModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _constellations.InsertOneAsync(model);
            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPut]
        public async Task<ActionResult> Update(ConstellationsModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var filter = Builders<ConstellationsModel>.Filter.Eq(c => c.Id, model.Id);
            var result = await _constellations.ReplaceOneAsync(filter, model);
            if (result.ModifiedCount == 0) return NotFound("Failed to update Constellation");
            return Ok(result);
        }

        [Authorize(Policy = "DeleteAccess")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<ConstellationsModel>.Filter.Eq(c => c.Id, id);
            var result = await _constellations.DeleteOneAsync(filter);
            if (result.DeletedCount == 0) return NotFound("Failed to delete Constellation");
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
            List<ConstellationsModel>? constellations = null;

            switch (extension)
            {
                case ".csv":
                        constellations = await _csvServices.ParseCsvAsync<ConstellationsModel>(file.OpenReadStream());
                    break;
                case ".json":
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    constellations = JsonSerializer.Deserialize<List<ConstellationsModel>>(fileContent, options);
                    break;
                case ".xml":
                    var serializer = new XmlSerializer(typeof(ConstellationXmlWrapper));
                    var xmlItems = (ConstellationXmlWrapper?)serializer.Deserialize(new StringReader(fileContent));
                    constellations = xmlItems?.Constellations.Select(x => new ConstellationsModel
                    {
                        Name = x.Name,
                        StarIds = x.StarIds,
                        Description = x.Description
                    }).ToList();
                    break;
                case ".xls":
                case ".xlsx":
                case ".xlsm":
                case ".xlsb":
                    constellations = ExcelServices.ParseExcel<ConstellationsModel>(file.OpenReadStream());
                    break;
                default:
                    return BadRequest("Unsupported file format. Please upload a CSV, JSON, XML, or Excel file.");
            }

            if (constellations == null || constellations.Count == 0) return BadRequest("No valid constellation data found in the file.");
            var existingConstellations = (await _constellations.Find(FilterDefinition<ConstellationsModel>.Empty).ToListAsync())
                .Select(x => x.Name.ToLowerInvariant())
                .ToHashSet();

            var newConstellations = constellations.Where(x => !existingConstellations.Contains(x.Name.ToLowerInvariant())).ToList();
            if (newConstellations.Count > 0) await _constellations.InsertManyAsync(newConstellations);

            return Ok(new
            {
                inserted = newConstellations.Count,
                skipped = constellations.Count - newConstellations.Count
            });
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("export")]
        public async Task<IActionResult> ExportFile(string format)
        {
            var constellations = await _constellations.Find(FilterDefinition<ConstellationsModel>.Empty).ToListAsync();
            if (constellations == null || constellations.Count == 0) return NotFound("No constellation data available for export.");
            format = format.ToLowerInvariant();
            string fileContent = string.Empty;
            string fileContentType = string.Empty;
            string fullFileName = $"constellations-{DateTime.Now}.{format}";

            switch (format)
            {
                case "csv":
                    fileContent = _csvServices.ConvertToCsv(constellations);
                    fileContentType = "text/csv";
                    break;
                case "json":
                    fileContent = JsonSerializer.Serialize(constellations);
                    fileContentType = "application/json";
                    break;
                case "xml":
                    fileContent = xmlBytes(constellations);
                    fileContentType = "application/xml";
                    break;
                case "xlsx":
                    var excelBytes = ExcelServices.ConvertToExcel(constellations);
                    fileContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    return File(excelBytes, fileContentType, fullFileName);
                default:
                    return BadRequest(new { error = "Unsupported export format. Supported formats: json, csv, xml, xlsx." });
            }
            byte[] fileBytes = System.Text.Encoding.UTF8.GetBytes(fileContent);
            return File(fileBytes, fileContentType, fullFileName);
        }

        private string xmlBytes(List<ConstellationsModel> items)
        {
            var wrapper = new ConstellationXmlWrapper
            {
                Constellations = items.Select(x => new ConstellationXmlModel
                {
                    Name = x.Name,
                    StarIds = x.StarIds,
                    Description = x.Description ?? string.Empty
                }).ToList()
            };
            using var stringWriter = new StringWriter();
            var serializer = new XmlSerializer(typeof(ConstellationXmlWrapper));
            serializer.Serialize(stringWriter, wrapper);
            return stringWriter.ToString();
        }
    }
}
