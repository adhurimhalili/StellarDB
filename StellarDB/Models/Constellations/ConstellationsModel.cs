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
		public string[]? StarId { get; set; }
		public string Description { get; set; }
	}
}
