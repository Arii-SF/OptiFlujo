namespace OptiFlujo.Api.Models;

public class DetalleVenta
{
    public int IdDetalle { get; set; }
    public int IdVenta { get; set; }
    public int IdProducto { get; set; }

    // RF-31: prescripcion que justifica la linea, si aplica
    public int? IdReceta { get; set; }

    public int Cantidad { get; set; }

    // RN-06: se conserva el precio del momento de la transaccion
    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }

    public Producto? Producto { get; set; }
}