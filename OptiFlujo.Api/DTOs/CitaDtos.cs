using System.ComponentModel.DataAnnotations;

namespace OptiFlujo.Api.DTOs;

public class CitaDto
{
    public int IdCita { get; set; }
    public int IdPaciente { get; set; }
    public string Paciente { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public DateTime FechaHora { get; set; }
    public string TipoAtencion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string? Notas { get; set; }
}

public class GuardarCitaRequest
{
    [Required]
    public int IdPaciente { get; set; }

    [Required]
    public DateTime FechaHora { get; set; }

    [Required, MaxLength(50)]
    public string TipoAtencion { get; set; } = string.Empty;

    public string? Notas { get; set; }
}