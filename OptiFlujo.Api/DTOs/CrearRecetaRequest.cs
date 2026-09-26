using System.ComponentModel.DataAnnotations;

namespace OptiFlujo.Api.DTOs;

public class CrearRecetaRequest
{
    [Required]
    public int IdPaciente { get; set; }

    [Range(-20, 20)] public decimal? OdEsfera { get; set; }
    [Range(-10, 10)] public decimal? OdCilindro { get; set; }
    [Range(0, 180)] public int? OdEje { get; set; }
    [Range(0, 4)] public decimal? OdAdicion { get; set; }

    [Range(-20, 20)] public decimal? OiEsfera { get; set; }
    [Range(-10, 10)] public decimal? OiCilindro { get; set; }
    [Range(0, 180)] public int? OiEje { get; set; }
    [Range(0, 4)] public decimal? OiAdicion { get; set; }

    public string? Observaciones { get; set; }
}