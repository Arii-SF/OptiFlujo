namespace OptiFlujo.Api.Models;

public class Venta
{
    public int IdVenta { get; set; }
    public int IdPaciente { get; set; }
    public int IdUsuario { get; set; }
    public DateTime FechaVenta { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }

    public Paciente? Paciente { get; set; }
    public ICollection<DetalleVenta> Detalles { get; set; } = new List<DetalleVenta>();
}