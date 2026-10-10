using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Services;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/citas")]
[Authorize]
public class CitasController : ControllerBase
{
    private readonly CitaService _servicio;

    public CitasController(CitaService servicio)
    {
        _servicio = servicio;
    }

    /// <summary>
    /// RF-15. Sin parametros devuelve la semana en curso, de lunes a domingo.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
    {
        var inicio = desde ?? InicioDeSemana(DateTime.Today);
        var fin = hasta ?? inicio.AddDays(7);

        return Ok(await _servicio.ObtenerPorRangoAsync(inicio, fin));
    }

    [HttpPost]
    public async Task<IActionResult> Agendar([FromBody] GuardarCitaRequest peticion)
    {
        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (cita, error) = await _servicio.AgendarAsync(peticion, idUsuario);

        return error is not null
            ? Conflict(new { mensaje = error })
            : Ok(cita);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Reprogramar(int id, [FromBody] GuardarCitaRequest peticion)
    {
        var (cita, error) = await _servicio.ReprogramarAsync(id, peticion);

        return error is not null
            ? Conflict(new { mensaje = error })
            : Ok(cita);
    }

    [HttpPatch("{id:int}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromQuery] string estado)
    {
        var error = await _servicio.CambiarEstadoAsync(id, estado);
        return error is not null ? BadRequest(new { mensaje = error }) : NoContent();
    }

    private static DateTime InicioDeSemana(DateTime dia)
    {
        var desplazamiento = ((int)dia.DayOfWeek + 6) % 7;
        return dia.AddDays(-desplazamiento).Date;
    }
}