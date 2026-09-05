namespace OptiFlujo.Api.DTOs;

public class UsuarioDto
{
    public int IdUsuario { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public DateTime FechaRegistro { get; set; }
}