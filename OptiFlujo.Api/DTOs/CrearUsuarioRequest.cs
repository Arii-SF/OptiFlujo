using System.ComponentModel.DataAnnotations;

namespace OptiFlujo.Api.DTOs;

public class CrearUsuarioRequest
{
    [Required, MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(100)]
    public string Correo { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Contrasenia { get; set; } = string.Empty;

    [Required]
    public string Rol { get; set; } = string.Empty;
}