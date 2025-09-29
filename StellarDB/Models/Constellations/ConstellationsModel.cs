using System.Xml.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace StellarDB.Models.Constellations
{
	public class ConstellationsModel
	{
		[BsonId]
		[BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
		public string? Id { get; set; }
		[BsonRequired]
		public string Name { get; set; }
		public string[]? StarIds { get; set; }
		public string Description { get; set; }
	}

	public class ConstellationsViewModel
	{
		public string Id { get; set; }
		public string Name { get; set; }
		public string[] Stars { get; set; }
		public string Description { get; set; }
	}

	public class ConstellationXmlWrapper
	{
		[XmlElement("constellation")]
		public List<ConstellationXmlModel> Constellations { get; set; }
    }
    public class ConstellationXmlModel
	{
		[XmlAttribute("id")]
		public string Id { get; set; }
		[XmlElement("name")]
		public string Name { get; set; }
		[XmlArray("stars")]
		[XmlArrayItem("starId")]
		public string[] StarIds { get; set; }
		[XmlElement("description")]
		public string Description { get; set; }
    }
}
