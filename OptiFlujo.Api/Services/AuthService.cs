using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OptiFlujo.Api.Data;
using OptiFlujo.Api.DTOs;

namespace OptiFlujo.Api.Services;

public class AuthService
{
    private readonly OptiFlujoDbContext _contexto;
    private readonly IConfiguration _configuracion;

    public AuthService(OptiFlujoDbContext contexto, IConfiguration configuracion)
    {
        _contexto = contexto;
        _configuracion = configuracion;
    }

    public async Task<LoginResponse?> AutenticarAsync(LoginRequest peticion)
    {
        var usuario = await _contexto.Usuarios
            .FirstOrDefaultAsync(u => u.Correo == peticion.Correo);

        // RF-02: no se distingue entre correo inexistente y contrasenia
        // incorrecta, para no revelar que cuentas existen.
        if (usuario is null || !usuario.Activo)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(peticion.Contrasenia, usuario.ContraseniaHash))
            return null;

        var minutos = int.TryParse(
            await _contexto.Configuraciones
                .Where(c => c.Clave == "sesion_duracion_minutos")
                .Select(c => c.Valor)
                .FirstOrDefaultAsync(), out var m) ? m : 480;

        var expira = DateTime.UtcNow.AddMinutes(minutos);
        var token = GenerarToken(usuario, expira);

        return new LoginResponse
        {
            Token = token,
            IdUsuario = usuario.IdUsuario,
            Nombre = usuario.Nombre,
            Correo = usuario.Correo,
            Rol = usuario.Rol.ToString(),
            Expira = expira
        };
    }

    private string GenerarToken(Models.Usuario usuario, DateTime expira)
    {
        var clave = _configuracion["Jwt:Clave"]
            ?? throw new InvalidOperationException("Falta la clave de firma.");

        var credenciales = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(clave)),
            SecurityAlgorithms.HmacSha256);

        var datos = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Email, usuario.Correo),
            new Claim(ClaimTypes.Role, usuario.Rol.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: "OptiFlujo",
            audience: "OptiFlujo",
            claims: datos,
            expires: expira,
            signingCredentials: credenciales);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}