namespace OptiFlujo.Api.DTOs;

public class LoginRequest
{
    public string Correo { get; set; } = string.Empty;
    public string Contrasenia { get; set; } = string.Empty;
}