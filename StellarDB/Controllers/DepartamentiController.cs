using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StellarDB.Models.Departamenti;

namespace StellarDB.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class DepartamentiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public DepartamentiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var departamenti = _context.Departamenti.ToList();
            return Ok(departamenti);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            var departamenti = _context.Departamenti.Find(id);
            if (departamenti == null)
            {
                return NotFound();
            }
            return Ok(departamenti);
        }

        [HttpPost]
        public IActionResult Create(DepartamentiModel departamenti)
        {
            _context.Departamenti.Add(departamenti);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetAll), new { id = departamenti.Id }, departamenti);
        }

        [HttpPut]
        public IActionResult Update(DepartamentiModel departamenti)
        {
            var existingDepartamenti = _context.Departamenti.Find(departamenti.Id);
            if (existingDepartamenti == null)
            {
                return NotFound();
            }
            existingDepartamenti.EmriDepartamentit = departamenti.EmriDepartamentit;
            existingDepartamenti.NumriZyrave = departamenti.NumriZyrave;
            _context.Departamenti.Update(existingDepartamenti);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
