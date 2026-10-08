namespace OptiFlujo.Api.Models;

public class AlertaReceta
{
    public int IdPaciente { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public int IdReceta { get; set; }
    public DateOnly FechaEmision { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public int DiasRestantes { get; set; }
    public string EstadoVigencia { get; set; } = string.Empty;
}