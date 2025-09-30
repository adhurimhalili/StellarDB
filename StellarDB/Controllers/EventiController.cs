using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Eventi;

namespace StellarDB.Controllers
{
    [AllowAnonymous] // shtoje qeta
    [Route("api/[controller]")]
    [ApiController]
    public class EventiController : ControllerBase
    {
        // copy paste
        private readonly ApplicationDbContext _context;
        public EventiController(ApplicationDbContext context)
        {
            _context = context;
        }
        // deri ktu

        // copy / paste funksionet edhe modifikoj sipas nevojes
        [HttpGet]
        public IActionResult GetAllEventi([FromQuery] string? festivaliId)
        {
            var eventi = string.IsNullOrEmpty(festivaliId)
                ? _context.Eventi.ToList()
                : _context.Eventi.Where(e => e.Id_festivali == festivaliId).ToList();
            return Ok(eventi);
        }

        [HttpPost]
        public IActionResult CreateEvent(EventiModel eventi)
        {
            _context.Eventi.Add(eventi);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetAllEventi), new { id = eventi.Id }, eventi);
        }

        [HttpPut]
        public IActionResult UpdateEvent(EventiModel eventi)
        {
            var existingEvent = _context.Eventi.Find(eventi.Id);
            if (existingEvent == null)
            {
                return NotFound();
            }
            existingEvent.EmriEventit = eventi.EmriEventit;
            existingEvent.Orari = eventi.Orari;
            existingEvent.Id_festivali = eventi.Id_festivali;
            _context.Eventi.Update(existingEvent);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
