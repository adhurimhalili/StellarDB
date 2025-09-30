using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StellarDB.Models.Festivali
{
    public class FestivaliModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string? Id { get; set; }
        public string EmriFestivalit { get; set; }
        public string LlojiFestivalit { get; set; }
    }
}
