namespace OptiFlujo.Api.Models;

public class Cita
{
    public int IdCita { get; set; }
    public int IdPaciente { get; set; }
    public int IdUsuario { get; set; }
    public DateTime FechaHora { get; set; }
    public string TipoAtencion { get; set; } = string.Empty;
    public string Estado { get; set; } = "PROGRAMADA";
    public string? Notas { get; set; }
    public DateTime FechaRegistro { get; set; }

    public Paciente? Paciente { get; set; }

    /// <summary>
    /// Estados conforme al diagrama H2. Los tres ultimos liberan el horario,
    /// de modo que puede volver a asignarse.
    /// </summary>
    public static readonly string[] Estados =
    {
        "PROGRAMADA", "CONFIRMADA", "EN_ATENCION", "ATENDIDA",
        "CANCELADA_PACIENTE", "CANCELADA_ESTABLECIMIENTO", "AUSENTE"
    };

    public static readonly string[] EstadosLiberadores =
    {
        "CANCELADA_PACIENTE", "CANCELADA_ESTABLECIMIENTO", "AUSENTE"
    };
}