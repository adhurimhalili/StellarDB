using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using StellarDB.Models.Composition;
using StellarDB.Services;

namespace StellarDB.Models.Star
{
    public class StarModel
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }
        [Required]
        [BsonRequired]
        public string Name { get; set; }
        [Required]
        [BsonRequired]
        public string? SpectralClassId { get; set; }
        [Required]
        [BsonRequired]
        public string? LuminosityClassId { get; set; }
        [Required]
        [BsonRequired]
        public double Magnitude { get; set; }
        [Required]
        [BsonRequired]
        public double Distance { get; set; } // in light-years
        [Required]
        [BsonRequired]
        public double Diameter { get; set; } // in kilometers
        [Required]
        [BsonRequired]
        public double Mass { get; set; } // in solar masses
        [Required]
        [BsonRequired]
        public double Temperature { get; set; } // in Kelvin
        [Required]
        [BsonRequired]
        public DateOnly DiscoveryDate { get; set; }
        [CompositionValidation]
        public List<CompositionModel>? Composition { get; set; }
        public string? Description { get; set; }
    }
    public class StarQueryParameters
    {
        public string? Name { get; set; } = string.Empty;
        public string? SpectralClassId { get; set; } = string.Empty;
        public string? LuminosityClassId { get; set; } = string.Empty;
        public double? MinMagnitude { get; set; }
        public double? MaxMagnitude { get; set; }
        public double? MinDistance { get; set; }
        public double? MaxDistance { get; set; }
        public double? MinMass { get; set; }
        public double? MaxMass { get; set; }
        public double? MinDiameter { get; set; }
        public double? MaxDiameter { get; set; }
        public double? MinTemperature { get; set; }
        public double? MaxTemperature { get; set; }
        public DateOnly? From { get; set; }
        public DateOnly? To { get; set; }
    }
    public class StarXmlWrapper
    {
        [XmlElement("Star")]
        public List<StarXmlModel> Items { get; set; } = new();
    }
    public class StarXmlModel
    {
        [XmlElement("Name")]
        public string Name { get; set; }
        [XmlElement("SpectralClass")]
        public string? SpectralClassId { get; set; }
        [XmlElement("Magnitude")]
        public double Magnitude { get; set; }
        [XmlElement("Distance")]
        public double Distance { get; set; } // in light-years
        [XmlElement("Diameter")]
        public double Diameter { get; set; } // in kilometers
        [XmlElement("Mass")]
        public double Mass { get; set; } // in solar masses
        [XmlElement("Temperature")]
        public double Temperature { get; set; } // in Kelvin
        [XmlElement("DiscoveryDate")]
        public DateOnly DiscoveryDate { get; set; }
    }
}
