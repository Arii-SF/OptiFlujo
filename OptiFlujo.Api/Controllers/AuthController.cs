using Microsoft.AspNetCore.Mvc;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Services;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest peticion)
    {
        if (string.IsNullOrWhiteSpace(peticion.Correo) ||
            string.IsNullOrWhiteSpace(peticion.Contrasenia))
            return BadRequest(new { mensaje = "Debe indicar correo y contrasenia." });

        var resultado = await _auth.AutenticarAsync(peticion);

        if (resultado is null)
            return Unauthorized(new { mensaje = "Las credenciales no son validas." });

        return Ok(resultado);
    }
}