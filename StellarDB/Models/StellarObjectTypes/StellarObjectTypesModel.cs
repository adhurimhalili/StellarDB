using System.Xml.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StellarDB.Models.StellarObjectTypes
{
    public class StellarObjectTypesModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("Name")]
        public string Name { get; set; }
        public string Description { get; set; }
    }

    [XmlRoot("root")]
    public class StellarObjectTypesXmlWrapper
    {
        [XmlElement("StellarObjectType")]
        public List<StellarObjectTypesXmlModel> Items { get; set; } = new();
    }

    public class StellarObjectTypesXmlModel
    {
        //[XmlElement("Name")]
        public string Name { get; set; }

        //[XmlElement("Description")]
        public string Description { get; set; }
    }
}
