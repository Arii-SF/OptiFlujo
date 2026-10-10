using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Services;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/ventas")]
[Authorize]
public class VentasController : ControllerBase
{
    private readonly VentaService _servicio;

    public VentasController(VentaService servicio)
    {
        _servicio = servicio;
    }

    [HttpPost]
    public async Task<IActionResult> Procesar([FromBody] ProcesarVentaRequest peticion)
    {
        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (venta, error) = await _servicio.ProcesarAsync(peticion, idUsuario);

        return error is not null
            ? BadRequest(new { mensaje = error })
            : Ok(venta);
    }
}