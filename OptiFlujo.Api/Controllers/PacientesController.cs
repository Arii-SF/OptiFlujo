using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptiFlujo.Api.DTOs;
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

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearPacienteRequest peticion)
    {
        var (paciente, error) = await _servicio.CrearAsync(peticion);

        return error is not null
            ? BadRequest(new { mensaje = error })
            : CreatedAtAction(nameof(Expediente),
                new { id = paciente!.IdPaciente }, paciente);
    }
}