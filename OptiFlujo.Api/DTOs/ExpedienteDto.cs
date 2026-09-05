namespace OptiFlujo.Api.DTOs;

public class ExpedienteDto
{
    public int IdPaciente { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Dpi { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
    public int? Edad { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public decimal? DistanciaInterpupilar { get; set; }
    public string? AntecedentesOculares { get; set; }
    public List<RecetaDto> Historial { get; set; } = new();
}