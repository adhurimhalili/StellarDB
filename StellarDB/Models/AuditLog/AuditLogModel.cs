namespace StellarDB.Models.AuditLog
{
    public class AuditLogModel
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; }
        public string Action { get; set; }
        public string Description { get; set; }
        public string? EntityId { get; set; }
        public string? EntityName { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public Severity Severity { get; set; }
        public string CorrelationId { get; set; } = Guid.NewGuid().ToString();
    }

    public class AuditLogQueryParameters
    {
        public string? UserId { get; set; }
        public string? Action { get; set; }
        public string? EntityId { get; set; }
        public string? EntityName { get; set; }
        public DateTime? From { get; set; } = DateTime.UtcNow.AddDays(-7);
        public DateTime? To { get; set; } = DateTime.UtcNow;
        public Severity? Severity { get; set; }
        //public int PageNumber { get; set; } = 1;
        //public int PageSize { get; set; } = 10;
    }

    public enum Severity
    {
        Emergency,      // system is unusable
        Alert,          // action must be taken immediately
        Criztical,      // critical conditions
        Error,          // error conditions
        Warning,        // warning conditions
        Notice,         // normal but significant condition
        Informational,  // informational messages
        Debug           // debug-level messages
    }
}
