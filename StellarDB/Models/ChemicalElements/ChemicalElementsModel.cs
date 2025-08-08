using System.Xml.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace StellarDB.Models.ChemicalElements
{
    public class ChemicalElementsModel
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }
        public int AtomicNumber { get; set; }
        public double AtomicWeight { get; set; }
        public string Symbol { get; set; }
        public string Name { get; set; }
        public double? MeltingPoint { get; set; }
        public double? BoilingPoint { get; set; }
        public int Period { get; set; }
        public int Group { get; set; }
        public string? DiscoveryYear { get; set; }
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
        public string? DiscoveryYear { get; set; }
        [XmlElement("Description")]
        public string? Description { get; set; }
    }
}
