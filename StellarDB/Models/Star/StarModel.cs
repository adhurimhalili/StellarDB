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
        public string Name { get; set; }
        public string? SpectralClassId { get; set; }
        public string? LuminosityClassId { get; set; }
        public double Magnitude { get; set; }
        public double Distance { get; set; } // in light-years
        public double Diameter { get; set; } // in kilometers
        public double Mass { get; set; } // in solar masses
        public double Temperature { get; set; } // in Kelvin
        public DateOnly DiscoveryDate { get; set; }
        [CompositionValidation]
        public List<CompositionModel>? Composition { get; set; }
        public string? Description { get; set; }
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
