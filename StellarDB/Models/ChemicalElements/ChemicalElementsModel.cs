using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace StellarDB.Models.ChemicalElements
{
    public class ChemicalElementsModel
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Atomic number is required")]
        [Range(1, 200, ErrorMessage = "Atomic number must be between 1 and 200")]
        public int AtomicNumber { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Atomic weight is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Atomic weight must be a positive value")]
        public double AtomicWeight { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Element symbol is required")]
        [MaxLength(3)]
        public string Symbol { get; set; }

        [BsonRequired]
        [Required(ErrorMessage = "Element name is required")]
        public string Name { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Melting point must be a positive value")]
        public double? MeltingPoint { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Boiling point must be a positive value")]
        public double? BoilingPoint { get; set; }

        [Range(1, 7, ErrorMessage = "Period must be between 1 and 7")]
        public int Period { get; set; }

        [Range(1, 18, ErrorMessage = "Group must be between 1 and 18")]
        public int Group { get; set; }

        public int? DiscoveryYear { get; set; }
        public string? Description { get; set; }
    }

    public class ChemicalElementsXmlWrapper
    {
        [XmlElement("ChemicalElement")]
        public List<ChemicalElementsXmlModel> Items { get; set; } = new();
    }

    public class ChemicalElementsXmlModel
    {
        [XmlElement("AtomicNumber")]
        public int AtomicNumber { get; set; }
        [XmlElement("Symbol")]
        public string Symbol { get; set; }
        [XmlElement("Name")]
        public string Name { get; set; }
        [XmlElement("AtomicWeight")]
        public double AtomicWeight { get; set; }
        [XmlElement("MeltingPoint")]
        public double? MeltingPoint { get; set; }
        [XmlElement("BoilingPoint")]
        public double? BoilingPoint { get; set; }
        [XmlElement("Period")]
        public int Period { get; set; }
        [XmlElement("Group")]
        public int Group { get; set; }
        [XmlElement("DiscoveryDate")]
        public int? DiscoveryYear { get; set; }
        [XmlElement("Description")]
        public string? Description { get; set; }
    }
}
