using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StellarDB.Models.Asistenti
{
    public class AsistentiModel
    {
        [Key] // copy edhe keto per Id
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string? Id { get; set; }
        public string? Emri { get; set; }
        public string? Mbiemri { get; set; }
        public string? Pozita { get; set; }
        public string? Id_Departamenti { get; set; }
    }
}
