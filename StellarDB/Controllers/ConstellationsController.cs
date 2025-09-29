using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.Constellations;
using StellarDB.Models.Star;

namespace StellarDB.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ConstellationsController : ControllerBase
	{
		private readonly IMongoCollection<ConstellationsModel> _constellations;
		private readonly IMongoCollection<StarModel> _stars;

		public ConstellationsController(MongoDbService mongoDbService)
		{
			_constellations = mongoDbService.Database.GetCollection<ConstellationsModel>("Constellations");
			_stars = mongoDbService.Database.GetCollection<StarModel>("Stars");
		}

		[HttpGet]
        public async Task<IEnumerable<ConstellationsViewModel>> Get()
        {
            var constellations = await _constellations.Find(FilterDefinition<ConstellationsModel>.Empty).ToListAsync();

            var starIds = constellations
                .Where(c => c.StarIds != null)
                .SelectMany(c => c.StarIds)
                .Distinct()
                .ToList();

            var starsDict = new Dictionary<string, string>();
            if (starIds.Count > 0)
            {
                var stars = await _stars.Find(s => starIds.Contains(s.Id)).ToListAsync();
                starsDict = stars
                    .Where(s => s.Id != null)
                    .ToDictionary(s => s.Id!, s => s.Name);
            }

            var result = constellations.Select(c => new ConstellationsViewModel
            {
                Id = c.Id ?? string.Empty,
                Name = c.Name,
                Description = c.Description,
                Stars = c.StarIds?.Select(id => starsDict.ContainsKey(id) ? starsDict[id] : id).ToArray() ?? Array.Empty<string>()
            });

            return result;
        }

		[HttpGet("{id}")]
		public async Task<ActionResult<ConstellationsModel>> GetById(string id)
		{
			var constellation = await _constellations.Find(c => c.Id == id).FirstOrDefaultAsync();
			if (constellation == null) return NotFound();
			return constellation;
		}

		[HttpPost]
		public async Task<ActionResult> Create(ConstellationsModel model)
		{
			if (!ModelState.IsValid) return BadRequest(ModelState);

			await _constellations.InsertOneAsync(model);
			return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
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
