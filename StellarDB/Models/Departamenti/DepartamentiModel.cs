using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StellarDB.Models.Departamenti
{
    public class DepartamentiModel
    {
        [Key] // copy edhe keto per Id
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string? Id { get; set; }
        public string? EmriDepartamentit { get; set; }
        public int? NumriZyrave { get; set; }
    }
}
