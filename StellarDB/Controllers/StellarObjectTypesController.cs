using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using StellarDB.Data;
using StellarDB.Models.StellarObjectTypes;

namespace StellarDB.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StellarObjectTypesController : ControllerBase
    {
        private readonly IMongoCollection<StellarObjectTypesModel>? _stellarObjectTypes;
        public StellarObjectTypesController(MongoDbService mongoDbService)
        {
            _stellarObjectTypes = mongoDbService.Database.GetCollection<StellarObjectTypesModel>("StellarObjectTypes");
        }

        [HttpGet]
        public async Task<IEnumerable<StellarObjectTypesModel>> Get()
        {
            return await _stellarObjectTypes.Find(FilterDefinition<StellarObjectTypesModel>.Empty)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StellarObjectTypesModel?>> GetById(string id)
        {
            var filter = Builders<StellarObjectTypesModel>.Filter.Eq(stBody => stBody.Id, id);
            var stellarObjectType = _stellarObjectTypes.Find(filter).FirstOrDefault();

            return stellarObjectType is not null ? Ok(stellarObjectType) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult> Create(StellarObjectTypesModel stellarObjectType)
        {
            await _stellarObjectTypes.InsertOneAsync(stellarObjectType);
            return CreatedAtAction(nameof(GetById), new { id = stellarObjectType.Id }, stellarObjectType);
        }

        [HttpPut]
        public async Task<ActionResult> Update(StellarObjectTypesModel stellarObjectType)
        {
            var filter = Builders<StellarObjectTypesModel>.Filter.Eq(x => x.Id, stellarObjectType.Id);

            //var update = Builders<StellarObjectTypesModel>.Update
            //    .Set(x => x.Name, stellarObjectType.Name)
            //    .Set(x => x.Description, stellarObjectType.Description);
            //await _stellarObjectTypes.UpdateOneAsync(filter, update);


            await _stellarObjectTypes.ReplaceOneAsync(filter, stellarObjectType);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var filter = Builders<StellarObjectTypesModel>.Filter.Eq(stBody => stBody.Id, id);

            await _stellarObjectTypes.DeleteOneAsync(filter);
            return Ok();
        }
    }
}
