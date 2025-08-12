using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StellarDB.Models.PlanetTypes
{
    public class PlanetTypesModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
    }

    public class PlanetTypesXmlWrapper
    {
        [XmlElement("PlanetType")]
        public List<PlanetTypesXmlModel> Items { get; set; } = new();
    }

    public class PlanetTypesXmlModel
    {
        [XmlElement("Name")]
        public string Name { get; set; }
        [XmlElement("Description")]
        public string Description { get; set; }
    }
}
