using System.ComponentModel.DataAnnotations;

namespace OptiFlujo.Api.DTOs;

public class GuardarProductoRequest
{
    [Required, MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    public int IdCategoria { get; set; }

    public string? Descripcion { get; set; }

    [Range(0.01, 999999)]
    public decimal Precio { get; set; }

    [Range(0, 999999)]
    public int StockActual { get; set; }

    [Range(0, 999999)]
    public int StockMinimo { get; set; }

    public bool BajoPedido { get; set; }
}