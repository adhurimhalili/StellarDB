using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StellarDB.Models.Eventi
{
    public class EventiModel
    {
        [Key] // copy edhe keto per Id
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string? Id { get; set; } // deri ktu
        public string EmriEventit { get; set; } // shto fusha sipas nevojes; string = text, int = number
        public string Orari { get; set; }
        public string Id_festivali { get; set; }
    }
}
