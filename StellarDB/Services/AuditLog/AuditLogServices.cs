using DocumentFormat.OpenXml.Bibliography;
using Microsoft.EntityFrameworkCore;
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

        public async Task<List<AuditLogModel>> QueryAsync(AuditLogQueryParameters parameters)
        {
            var query = _context.AuditLogs.AsQueryable();
            if (!string.IsNullOrEmpty(parameters.UserId))
                query = query.Where(log => log.UserId == parameters.UserId);
            if (!string.IsNullOrEmpty(parameters.Action))
                query = query.Where(log => log.Action == parameters.Action);
            if (!string.IsNullOrEmpty(parameters.EntityId))
                query = query.Where(log => log.EntityId == parameters.EntityId);
            if (!string.IsNullOrEmpty(parameters.EntityName))
                query = query.Where(log => log.EntityName == parameters.EntityName);
            if (parameters.From.HasValue)
                query = query.Where(log => log.Timestamp >= parameters.From.Value);
            if (parameters.To.HasValue)
                query = query.Where(log => log.Timestamp <= parameters.To.Value);
            if (parameters.Severity.HasValue)
                query = query.Where(log => log.Severity == parameters.Severity.Value);

            return await query.ToListAsync();
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
