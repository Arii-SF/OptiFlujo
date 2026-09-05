using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Data;
using Microsoft.AspNetCore.Authorization;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/diagnostico")]
[Authorize]
public class DiagnosticoController : ControllerBase
{
    private readonly OptiFlujoDbContext _contexto;

    public DiagnosticoController(OptiFlujoDbContext contexto)
    {
        _contexto = contexto;
    }

    [HttpGet]
    public async Task<IActionResult> Obtener()
    {
        var usuarios = await _contexto.Usuarios.CountAsync();
        var pacientes = await _contexto.Pacientes.CountAsync();
        var recetas = await _contexto.Recetas.CountAsync();

        var listado = await _contexto.Pacientes
            .Select(p => new { p.IdPaciente, p.NombreCompleto, p.Telefono })
            .ToListAsync();

        return Ok(new { usuarios, pacientes, recetas, listado });
    }
}
