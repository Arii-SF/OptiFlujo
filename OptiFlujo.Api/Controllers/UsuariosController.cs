using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Services;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = "ADMINISTRADOR")]
public class UsuariosController : ControllerBase
{
    private readonly UsuarioService _servicio;

    public UsuariosController(UsuarioService servicio)
    {
        _servicio = servicio;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
        => Ok(await _servicio.ListarAsync());

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearUsuarioRequest peticion)
    {
        var (usuario, error) = await _servicio.CrearAsync(peticion);

        if (error is not null)
            return BadRequest(new { mensaje = error });

        return CreatedAtAction(nameof(Listar), new { id = usuario!.IdUsuario }, usuario);
    }

    [HttpPatch("{id:int}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromQuery] bool activo)
    {
        var exito = await _servicio.CambiarEstadoAsync(id, activo);
        return exito ? NoContent() : NotFound();
    }
}