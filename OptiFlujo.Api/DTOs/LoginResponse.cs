namespace OptiFlujo.Api.DTOs;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public int IdUsuario { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime Expira { get; set; }
}