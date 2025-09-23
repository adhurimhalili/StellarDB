using DocumentFormat.OpenXml.Bibliography;
using StellarDB.Models.AuditLog;

namespace StellarDB.Services.AuditLog
{
    public class AuditLogServices : IAuditLogServices
    {
        private readonly ApplicationDbContext _context;
        public AuditLogServices(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(
            string action, 
            string description,
            string ipAddress,
            string? entityId, 
            string? entityName, 
            string? userAgent, 
            string? userId,
            string? correlationId)
        {
            var log = new AuditLogModel
            {
                UserId = userId,
                Action = action,
                Description = description,
                EntityId = entityId,
                EntityName = entityName,
                IpAddress = ipAddress, // You can capture IP address from the request context if available
                UserAgent = userAgent, // You can capture User-Agent from the request context if available
                Severity = Severity.Informational, // Default severity, can be adjusted based on action,
                CorrelationId = correlationId ?? Guid.NewGuid().ToString()
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }

    public static class CorrelationIdHelper
    {
        public const string CorrelationIdHeader = "X-Correlation-ID";

        public static string? GetCorrelationId(HttpContext context)
        {
            return context.Items.TryGetValue(CorrelationIdHeader, out var value) ? value?.ToString() : null;
        }
    }
}
