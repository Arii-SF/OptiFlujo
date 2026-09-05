namespace OptiFlujo.Api.Models;

public class Configuracion
{
    public string Clave { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string TipoDato { get; set; } = "TEXTO";
    public DateTime FechaModificacion { get; set; }
}