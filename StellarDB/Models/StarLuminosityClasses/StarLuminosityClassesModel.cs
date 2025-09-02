using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StellarDB.Models.StarLuminosityClasses
{
    public class StarLuminosityClassesModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Luminosity class code is required")]
        [MaxLength(4)]
        public string Code { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; }

        public string Description { get; set; }
    }
    public class StarLuminosityClassesXmlWrapper
    {
        [XmlElement("StarLuminosityClass")]
        public List<StarLuminosityClassesXmlModel> Items { get; set; } = new();
    }
    public class StarLuminosityClassesXmlModel
    {
        [XmlElement("Code")]
        public string Code { get; set; }
        [XmlElement("Name")]
        public string Name { get; set; }
        [XmlElement("Description")]
        public string Description { get; set; }
    }
}
