using System.ComponentModel.DataAnnotations;

namespace OptiFlujo.Api.DTOs;

public class CrearPacienteRequest
{
    [Required, MaxLength(150)]
    public string NombreCompleto { get; set; } = string.Empty;

    [MaxLength(13)]
    public string? Dpi { get; set; }

    public DateOnly? FechaNacimiento { get; set; }

    [MaxLength(15)]
    public string? Telefono { get; set; }

    [EmailAddress, MaxLength(100)]
    public string? Correo { get; set; }

    [Range(40, 80)]
    public decimal? DistanciaInterpupilar { get; set; }

    public string? AntecedentesOculares { get; set; }
}