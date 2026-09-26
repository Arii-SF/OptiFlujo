using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Services;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/recetas")]
[Authorize(Roles = "ADMINISTRADOR,OPTOMETRISTA")]
public class RecetasController : ControllerBase
{
    private readonly PacienteService _servicio;

    public RecetasController(PacienteService servicio)
    {
        _servicio = servicio;
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearRecetaRequest peticion)
    {
        var idUsuario = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var (receta, error) = await _servicio.CrearRecetaAsync(peticion, idUsuario);

        return error is not null
            ? BadRequest(new { mensaje = error })
            : Ok(receta);
    }
}