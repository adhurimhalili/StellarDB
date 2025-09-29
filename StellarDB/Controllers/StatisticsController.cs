using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Services.Statistics;

namespace StellarDB.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsServices _statisticsServices;
        public StatisticsController(IStatisticsServices statisticsServices)
        {
            _statisticsServices = statisticsServices;
        }

        [HttpGet("user-count")]
        public async Task<IActionResult> GetUserCount()
        {
            return await _statisticsServices.GetUserCountByRoleAsync() is IDictionary<string, int> result
                ? Ok(result)
                : StatusCode(500, "Failed to retrieve planet statistics.");
        }

        [HttpGet("user-activity")]
        public async Task<IActionResult> GetUserActivity()
        {
            return await _statisticsServices.GetUserActivityAsync() is Dictionary<string, int> result 
                ? Ok(result)
                : StatusCode(500, "Failed to retrieve activity statistics.");
        }

        [HttpGet("entity-activity")]
        public async Task<IActionResult> GetEntityActivity()
        {
            return await _statisticsServices.GetEntityActivity() is Dictionary<string, int> result
                ? Ok(result)
                : StatusCode(500, "Failed to retrieve activity statistics.");
        }
    }
}
