using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StellarDB.Models.Eventi
{
    public class EventiModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string? Id { get; set; }
        public string EmriEventit { get; set; }
        public string Orari { get; set; }
        public string Id_festivali { get; set; }
    }
}
