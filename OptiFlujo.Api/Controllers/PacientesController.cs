using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptiFlujo.Api.Services;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/pacientes")]
[Authorize]
public class PacientesController : ControllerBase
{
    private readonly PacienteService _servicio;

    public PacientesController(PacienteService servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    public async Task<IActionResult> Buscar([FromQuery] string? busqueda)
        => Ok(await _servicio.BuscarAsync(busqueda));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Expediente(int id)
    {
        var expediente = await _servicio.ObtenerExpedienteAsync(id);
        return expediente is null ? NotFound() : Ok(expediente);
    }
}