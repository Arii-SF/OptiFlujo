namespace OptiFlujo.Api.DTOs;

public class ProductoDto
{
    public int IdProducto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int IdCategoria { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; }
    public bool BajoPedido { get; set; }
    public bool RequiereReorden { get; set; }
}