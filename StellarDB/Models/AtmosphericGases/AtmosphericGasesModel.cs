using System.Xml.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace StellarDB.Models.AtmosphericGases
{
    public class AtmosphericGasesModel
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Name { get; set; }
        public string Formula { get; set; }
        public double MolecularWeight { get; set; }
        public double Density { get; set; } // in kg/m^3
        public double? BoilingPoint { get; set; } // in Kelvin
        public double? MeltingPoint { get; set; } // in Kelvin
        public int? DiscoveryYear { get; set; }
        public string Description { get; set; }
    }
    public class AtmosphericGasesXmlWrapper
    {
        [XmlElement("AtmosphericGas")]
        public List<AtmosphericGasesXmlModel> Items { get; set; } = new();
    }

    public class AtmosphericGasesXmlModel
    {
        [XmlElement("Name")]
        public string Name { get; set; }
        [XmlElement("Formula")]
        public string Formula { get; set; }
        [XmlElement("MolecularWeight")]
        public double MolecularWeight { get; set; }
        [XmlElement("Density")]
        public double Density { get; set; } // in kg/m^3
        [XmlElement("BoilingPoint")]
        public double? BoilingPoint { get; set; } // in Kelvin
        [XmlElement("MeltingPoint")]
        public double? MeltingPoint { get; set; } // in Kelvin
        [XmlElement("DiscoveryYear")]
        public int? DiscoveryYear { get; set; }
        [XmlElement("Description")]
        public string Description { get; set; }
    }
}
