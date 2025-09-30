using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StellarDB.Models.Festivali
{
    public class FestivaliModel
    {
        [Key] // copy edhe keto per Id
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string? Id { get; set; } // deri ktu
        public string EmriFestivalit { get; set; } // shto fusha sipas nevojes; string = text, int = number
        public string LlojiFestivalit { get; set; }
    }
}
