namespace OptiFlujo.Api.Models;

public class Producto
{
    public int IdProducto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int IdCategoria { get; set; }
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; }

    // RN-07: los productos bajo pedido no validan existencia
    public bool BajoPedido { get; set; }

    public bool Activo { get; set; } = true;

    public Categoria? Categoria { get; set; }

    public bool RequiereReorden() => !BajoPedido && StockActual <= StockMinimo;
}