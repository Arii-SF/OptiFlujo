using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Data;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Models;

namespace OptiFlujo.Api.Services;

public class UsuarioService
{
    private readonly OptiFlujoDbContext _contexto;

    public UsuarioService(OptiFlujoDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<List<UsuarioDto>> ListarAsync()
        => await _contexto.Usuarios
            .OrderBy(u => u.Nombre)
            .Select(u => new UsuarioDto
            {
                IdUsuario = u.IdUsuario,
                Nombre = u.Nombre,
                Correo = u.Correo,
                Rol = u.Rol.ToString(),
                Activo = u.Activo,
                FechaRegistro = u.FechaRegistro
            })
            .ToListAsync();

    public async Task<(UsuarioDto? usuario, string? error)> CrearAsync(CrearUsuarioRequest peticion)
    {
        if (!Enum.TryParse<RolUsuario>(peticion.Rol, out var rol))
            return (null, "El rol indicado no es valido.");

        if (await _contexto.Usuarios.AnyAsync(u => u.Correo == peticion.Correo))
            return (null, "Ya existe un usuario con ese correo.");

        var usuario = new Usuario
        {
            Nombre = peticion.Nombre,
            Correo = peticion.Correo,
            ContraseniaHash = BCrypt.Net.BCrypt.HashPassword(peticion.Contrasenia, 11),
            Rol = rol,
            Activo = true
        };

        _contexto.Usuarios.Add(usuario);
        await _contexto.SaveChangesAsync();

        return (new UsuarioDto
        {
            IdUsuario = usuario.IdUsuario,
            Nombre = usuario.Nombre,
            Correo = usuario.Correo,
            Rol = usuario.Rol.ToString(),
            Activo = usuario.Activo,
            FechaRegistro = usuario.FechaRegistro
        }, null);
    }

    /// <summary>
    /// RN-08 aplicado a usuarios: no se elimina, se desactiva, para conservar
    /// la trazabilidad de las recetas y ventas que registro.
    /// </summary>
    public async Task<bool> CambiarEstadoAsync(int id, bool activo)
    {
        var usuario = await _contexto.Usuarios.FindAsync(id);
        if (usuario is null) return false;

        usuario.Activo = activo;
        await _contexto.SaveChangesAsync();
        return true;
    }
}