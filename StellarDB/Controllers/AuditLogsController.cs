using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StellarDB.Models.AuditLog;
using StellarDB.Services.AuditLog;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogServices _auditLogServices;
        public AuditLogsController(IAuditLogServices auditLogServices)
        {
            _auditLogServices = auditLogServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuditLogsAsync([FromQuery] AuditLogQueryParameters parameters)
        {
            var auditLogs = await _auditLogServices.QueryAsync(parameters);
            return Ok(auditLogs);
        }
    }
}
