namespace OptiFlujo.Api.DTOs;

public class PacienteListaDto
{
    public int IdPaciente { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Dpi { get; set; }
    public string? Telefono { get; set; }
    public DateOnly? UltimaReceta { get; set; }
    public string EstadoVigencia { get; set; } = "SIN_RECETA";
}