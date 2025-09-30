using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Festivali;

namespace StellarDB.Controllers
{
    [AllowAnonymous] // shto kete
    [Route("api/[controller]")]
    [ApiController]
    public class FestivaliController : ControllerBase
    {
        // copy paste
        private readonly ApplicationDbContext _context;
        public FestivaliController(ApplicationDbContext context)
        {
            _context = context;
        }
        // deri ktu

        // copy / paste funksionet edhe modifikoj sipas nevojes
        [HttpGet]
        public IActionResult GetAllFestivali()
        {
            var festivali = _context.Festivali.ToList();
            return Ok(festivali);
        }

        [HttpGet("{id}")]
        public IActionResult GetFestivalById(string id)
        {
            var festival = _context.Festivali.Find(id);
            if (festival == null)
            {
                return NotFound();
            }
            return Ok(festival);
        }

        [HttpPost]
        public IActionResult CreateFestival(FestivaliModel festival)
        {
            _context.Festivali.Add(festival);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetAllFestivali), new { id = festival.Id }, festival);
        }

        [HttpPut]
        public IActionResult UpdateFestival(FestivaliModel festival)
        {
            var existingFestival = _context.Festivali.Find(festival.Id);
            if (existingFestival == null)
            {
                return NotFound();
            }
            existingFestival.EmriFestivalit = festival.EmriFestivalit;
            existingFestival.LlojiFestivalit = festival.LlojiFestivalit;
            _context.Festivali.Update(existingFestival);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteFestival(string id)
        {
            var festival = _context.Festivali.Find(id);
            if (festival == null)
            {
                return NotFound();
            }
            _context.Festivali.Remove(festival);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
