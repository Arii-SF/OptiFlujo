namespace OptiFlujo.Api.Models;

public class RecetaMedica
{
    public int IdReceta { get; set; }
    public int IdPaciente { get; set; }
    public int IdUsuario { get; set; }

    // Ojo derecho
    public decimal? OdEsfera { get; set; }
    public decimal? OdCilindro { get; set; }
    public int? OdEje { get; set; }
    public decimal? OdAdicion { get; set; }

    // Ojo izquierdo
    public decimal? OiEsfera { get; set; }
    public decimal? OiCilindro { get; set; }
    public int? OiEje { get; set; }
    public decimal? OiAdicion { get; set; }

    public DateOnly FechaEmision { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public string? Observaciones { get; set; }

    public Paciente? Paciente { get; set; }
    public Usuario? Usuario { get; set; }

    // RN-03: la prescripcion sigue vigente mientras no haya vencido
    public bool EsVigente(DateOnly hoy) => FechaVencimiento >= hoy;

    public int DiasParaVencer(DateOnly hoy) => FechaVencimiento.DayNumber - hoy.DayNumber;
}