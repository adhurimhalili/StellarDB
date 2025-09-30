using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Asistenti;

namespace StellarDB.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AsistentiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AsistentiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] string? departamentiId)
        {
            var asistenti = string.IsNullOrEmpty(departamentiId)
                ? _context.Asistenti.ToList()
                : _context.Asistenti.Where(a => a.Id_Departamenti == departamentiId).ToList();
;            return Ok(asistenti);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            var asistenti = _context.Asistenti.Find(id);
            if (asistenti == null)
            {
                return NotFound();
            }
            return Ok(asistenti);
        }

        [HttpPost]
        public IActionResult Create(AsistentiModel asistenti)
        {
            _context.Asistenti.Add(asistenti);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetAll), new { id = asistenti.Id }, asistenti);
        }

        [HttpPut]
        public IActionResult Update(AsistentiModel asistenti)
        {
            var existingAsistenti = _context.Asistenti.Find(asistenti.Id);
            if (existingAsistenti == null)
            {
                return NotFound();
            }
            existingAsistenti.Emri = asistenti.Emri;
            existingAsistenti.Mbiemri = asistenti.Emri;
            existingAsistenti.Pozita = asistenti.Pozita;
            existingAsistenti.Id_Departamenti = asistenti.Id_Departamenti;
            _context.Asistenti.Update(existingAsistenti);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
