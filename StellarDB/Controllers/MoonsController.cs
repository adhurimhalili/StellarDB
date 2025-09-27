using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Moon;
using StellarDB.Services.Moons;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoonsController : ControllerBase
    {
        private readonly IMoonsServices _moonsServices;
        public MoonsController(IMoonsServices moonsServices)
        {
            _moonsServices = moonsServices;
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] MoonQueryParameters parameters)
        {
            return await _moonsServices.GetAllAsync(parameters) is List<MoonModel> moons
                ? Ok(moons)
                : NotFound();
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            return await _moonsServices.GetByIdAsync(id) is MoonModel moon
                ? Ok(moon)
                : NotFound();
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MoonModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                return await _moonsServices.CreateAsync(model)
                    ? CreatedAtAction(nameof(GetById), new { id = model.Id }, model)
                    : BadRequest("Failed to create moon");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] MoonModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                return await _moonsServices.UpdateAsync(model)
                    ? Ok("Moon updated successfully")
                    : BadRequest("Failed to update moon");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "DeleteAccess")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                return await _moonsServices.DeleteAsync(id)
                    ? Ok("Moon deleted successfully")
                    : BadRequest("Failed to delete moon");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = "WriteAccess")]
        [HttpPost("import")]
        public async Task<IActionResult> ImportFile(IFormFile file)
        {
            if (file is null || file.Length == 0) return BadRequest("No file uploaded.");
            try
            {
                (int inserted, int skipped) = await _moonsServices.ImportFileAsync(file);
                return Ok(new { inserted, skipped });
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [Authorize(Policy = "ReadAccess")]
        [HttpGet("export")]
        public async Task<IActionResult> Export(string format)
        {
            try
            {
                (byte[] fileBytes, string fileContentType, string fullFileName) = await _moonsServices.ExportFileAsync(format);
                return File(fileBytes, fileContentType, fullFileName);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }
    }
}
