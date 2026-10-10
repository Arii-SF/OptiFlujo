using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Services;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/inventario")]
[Authorize]
public class InventarioController : ControllerBase
{
    private readonly InventarioService _servicio;

    public InventarioController(InventarioService servicio)
    {
        _servicio = servicio;
    }

    [HttpGet("categorias")]
    public async Task<IActionResult> Categorias()
        => Ok(await _servicio.ListarCategoriasAsync());

    /// <summary>RF-21 y RF-22: consulta de existencias con filtros.</summary>
    [HttpGet("productos")]
    public async Task<IActionResult> Productos(
        [FromQuery] string? busqueda,
        [FromQuery] int? idCategoria,
        [FromQuery] bool bajoMinimo = false)
        => Ok(await _servicio.BuscarAsync(busqueda, idCategoria, bajoMinimo));

    // RF-18 a RF-20: la gestion del catalogo corresponde al administrador
    [HttpPost("productos")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Crear([FromBody] GuardarProductoRequest peticion)
    {
        var (producto, error) = await _servicio.CrearAsync(peticion);
        return error is not null
            ? BadRequest(new { mensaje = error })
            : Ok(producto);
    }

    [HttpPut("productos/{id:int}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] GuardarProductoRequest peticion)
    {
        var (producto, error) = await _servicio.ActualizarAsync(id, peticion);
        return error is not null
            ? BadRequest(new { mensaje = error })
            : Ok(producto);
    }

    [HttpDelete("productos/{id:int}")]
    [Authorize(Roles = "ADMINISTRADOR")]
    public async Task<IActionResult> Desactivar(int id)
        => await _servicio.DesactivarAsync(id) ? NoContent() : NotFound();
}

