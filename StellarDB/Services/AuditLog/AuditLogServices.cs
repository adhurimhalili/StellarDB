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
            Severity severity = action switch
            {
                "Login" or "Logout" => Severity.Informational,
                "Create" or "Update" => Severity.Warning,
                "Delete" => Severity.Critical,
                "FailedLogin" or "AccessDenied" => Severity.Error,
                "DataExport" or "DataImport" => Severity.Warning,
                "SystemError" or "Exception" => Severity.Critical,
                "Debug" or "Trace" => Severity.Debug,
                _ => Severity.Informational
            };

            var log = new AuditLogModel
            {
                UserId = userId,
                Action = action,
                Description = description,
                EntityId = entityId,
                EntityName = entityName,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Severity = severity,
                CorrelationId = correlationId ?? Guid.NewGuid().ToString()
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLogResult>> QueryAsync(AuditLogQueryParameters parameters)
        {
            var query = _context.AuditLogs.AsQueryable()
                .Where(log => string.IsNullOrEmpty(parameters.UserId)     || log.UserId == parameters.UserId)
                .Where(log => string.IsNullOrEmpty(parameters.Action)     || log.Action == parameters.Action)
                .Where(log => string.IsNullOrEmpty(parameters.EntityId)   || log.EntityId == parameters.EntityId)
                .Where(log => string.IsNullOrEmpty(parameters.EntityName) || log.EntityName == parameters.EntityName)
                .Where(log => !parameters.From.HasValue                   || log.Timestamp >= parameters.From.Value)
                .Where(log => !parameters.To.HasValue                     || log.Timestamp <= parameters.To.Value)
                .Where(log => !parameters.Severity.HasValue               || log.Severity == parameters.Severity.Value)
                .Where(log => string.IsNullOrEmpty(parameters.CorrelationId) || log.CorrelationId == parameters.CorrelationId)
                .OrderByDescending(log => log.Timestamp);

            var result = await query
                .Select(log => new AuditLogResult
                {
                    Id = log.Id,
                    UserId = log.UserId,
                    Action = log.Action,
                    Description = log.Description,
                    EntityId = log.EntityId,
                    EntityName = log.EntityName,
                    IpAddress = log.IpAddress,
                    UserAgent = log.UserAgent,
                    Timestamp = log.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"),
                    Severity = log.Severity,
                    CorrelationId = log.CorrelationId
                })
                .ToListAsync();

            return result.ToList();
        }
    }

}
