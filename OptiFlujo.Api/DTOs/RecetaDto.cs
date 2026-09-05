namespace OptiFlujo.Api.DTOs;

public class RecetaDto
{
    public int IdReceta { get; set; }
    public decimal? OdEsfera { get; set; }
    public decimal? OdCilindro { get; set; }
    public int? OdEje { get; set; }
    public decimal? OdAdicion { get; set; }
    public decimal? OiEsfera { get; set; }
    public decimal? OiCilindro { get; set; }
    public int? OiEje { get; set; }
    public decimal? OiAdicion { get; set; }
    public DateOnly FechaEmision { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public int DiasParaVencer { get; set; }
    public string EstadoVigencia { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
    public string RegistradaPor { get; set; } = string.Empty;
}