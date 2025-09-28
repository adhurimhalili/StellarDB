using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.Constellations;

namespace StellarDB.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ConstellationsController : ControllerBase
	{
		private readonly IMongoCollection<ConstellationsModel> _constellations;

		public ConstellationsController(MongoDbService mongoDbService)
		{
			_constellations = mongoDbService.Database.GetCollection<ConstellationsModel>("Constellations");
		}

		[HttpGet]
		public async Task<IEnumerable<ConstellationsModel>>Get()
		{
			return await _constellations.Find(FilterDefinition<ConstellationsModel>.Empty).ToListAsync();
		}

		[HttpGet("{id}")]
		public async Task<ActionResult<ConstellationsModel>> GetById(string constellationId)
		{
			var constellation = await _constellations.Find(c => c.Id == constellationId).FirstOrDefaultAsync();
			if (constellation == null) return NotFound();
			return constellation;
		}

		[HttpPost]
		public async Task<ActionResult> Create(ConstellationsModel model)
		{
			if (!ModelState.IsValid) return BadRequest(ModelState);

			await _constellations.InsertOneAsync(model);
			return CreatedAtAction(nameof(GetById), new { id = model.Id });
		}

		[HttpPut]
		public async Task<ActionResult> Update(ConstellationsModel model)
		{
			if (!ModelState.IsValid) return BadRequest(ModelState);

			var filter = Builders<ConstellationsModel>.Filter.Eq(c => c.Id, model.Id);
			var result = await _constellations.ReplaceOneAsync(filter, model);
			if (result.ModifiedCount > 0) return NotFound("Failed to update Constellation");
			return Ok(result);
		}
	}
}
