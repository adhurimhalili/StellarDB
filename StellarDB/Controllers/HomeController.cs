using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Services.Statistics;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly IStatisticsServices _statisticsServices;
        public HomeController(IStatisticsServices statisticsServices)
        {
            _statisticsServices = statisticsServices;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            // Return counts, averages, etc.
            return Ok(new { message = "Overview endpoint is under construction." });
        }

        [HttpGet("planets-by-type")]
        public async Task<IActionResult> GetPlanetsByType()
        {
            return await _statisticsServices.GetPlanetCountByTypeAsync() is IDictionary<string, int> result
                ? Ok(result)
                : StatusCode(500, "Failed to retrieve planet statistics.");
        }
    }
}
