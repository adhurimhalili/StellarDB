using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StellarDB.Models.StarSpectralClasses
{
    public class StarSpectralClassesModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Spectral class code is required")]
        [MaxLength(2)]
        public string Code { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Temperature range is required")]
        public string TemperatureRange { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Color is required")]
        public string Color { get; set; }

        public string Description { get; set; }
    }

    public class StarSpectralClassesXmlWrapper
    {
        [XmlElement("StarSpectralClass")]
        public List<StarSpectralClassesXmlModel> Items { get; set; } = new();
    }
    public class StarSpectralClassesXmlModel
    {
        [XmlElement("Code")]
        public string Code { get; set; }
        [XmlElement("TemperatureRange")]
        public string TemperatureRange { get; set; }
        [XmlElement("Color")]
        public string Color { get; set; }
        [XmlElement("Description")]
        public string Description { get; set; }
    }
}
