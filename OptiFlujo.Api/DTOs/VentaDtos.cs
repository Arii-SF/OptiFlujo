using System.ComponentModel.DataAnnotations;

namespace OptiFlujo.Api.DTOs;

public class LineaVentaRequest
{
    [Required] public int IdProducto { get; set; }
    [Range(1, 999)] public int Cantidad { get; set; }
    public int? IdReceta { get; set; }
}

public class ProcesarVentaRequest
{
    [Required] public int IdPaciente { get; set; }
    [Required, MinLength(1)] public List<LineaVentaRequest> Lineas { get; set; } = new();
}

public class LineaVentaDto
{
    public string Producto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class VentaDto
{
    public int IdVenta { get; set; }
    public string Paciente { get; set; } = string.Empty;
    public DateTime FechaVenta { get; set; }
    public decimal Total { get; set; }
    public List<LineaVentaDto> Lineas { get; set; } = new();
}
public class VentaResumenDto
{
    public int IdVenta { get; set; }
    public DateTime FechaVenta { get; set; }
    public decimal Total { get; set; }
    public string AtendidoPor { get; set; } = string.Empty;
    public List<LineaVentaDto> Lineas { get; set; } = new();
}