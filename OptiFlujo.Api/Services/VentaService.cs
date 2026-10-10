using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Data;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Models;

namespace OptiFlujo.Api.Services;

public class VentaService
{
    private readonly OptiFlujoDbContext _contexto;

    public VentaService(OptiFlujoDbContext contexto)
    {
        _contexto = contexto;
    }

    /// <summary>
    /// RF-29 y RNF-05. El registro de la transaccion y el descuento de
    /// existencias se confirman en conjunto: si algo falla, no se aplica
    /// ninguno de los dos.
    /// </summary>
    public async Task<(VentaDto? venta, string? error)> ProcesarAsync(
        ProcesarVentaRequest peticion, int idUsuario)
    {
        var paciente = await _contexto.Pacientes
            .FirstOrDefaultAsync(p => p.IdPaciente == peticion.IdPaciente);

        if (paciente is null) return (null, "El paciente indicado no existe.");
        if (peticion.Lineas.Count == 0) return (null, "La transaccion no tiene productos.");

        var ids = peticion.Lineas.Select(l => l.IdProducto).Distinct().ToList();

        var productos = await _contexto.Productos
            .Where(p => ids.Contains(p.IdProducto))
            .ToDictionaryAsync(p => p.IdProducto);

        // RF-28: se verifica la existencia antes de registrar nada
        foreach (var linea in peticion.Lineas)
        {
            if (!productos.TryGetValue(linea.IdProducto, out var producto))
                return (null, "Uno de los productos no existe.");

            // RN-07: los productos bajo pedido no validan existencia
            if (!producto.BajoPedido && producto.StockActual < linea.Cantidad)
                return (null, $"Existencia insuficiente de {producto.Nombre}. " +
                              $"Disponible: {producto.StockActual}.");
        }

        await using var transaccion = await _contexto.Database.BeginTransactionAsync();

        try
        {
            var venta = new Venta
            {
                IdPaciente = peticion.IdPaciente,
                IdUsuario = idUsuario,
                FechaVenta = DateTime.Now,
                Subtotal = 0,
                Total = 0
            };

            foreach (var linea in peticion.Lineas)
            {
                var producto = productos[linea.IdProducto];

                var detalle = new DetalleVenta
                {
                    IdProducto = producto.IdProducto,
                    IdReceta = linea.IdReceta,
                    Cantidad = linea.Cantidad,
                    PrecioUnitario = producto.Precio,
                    Subtotal = producto.Precio * linea.Cantidad
                };

                venta.Detalles.Add(detalle);
                venta.Subtotal += detalle.Subtotal;

                // RF-30: la existencia se descuenta al confirmar
                if (!producto.BajoPedido)
                    producto.StockActual -= linea.Cantidad;
            }

            venta.Total = venta.Subtotal;

            _contexto.Ventas.Add(venta);
            await _contexto.SaveChangesAsync();
            await transaccion.CommitAsync();

            return (new VentaDto
            {
                IdVenta = venta.IdVenta,
                Paciente = paciente.NombreCompleto,
                FechaVenta = venta.FechaVenta,
                Total = venta.Total,
                Lineas = venta.Detalles.Select(d => new LineaVentaDto
                {
                    Producto = productos[d.IdProducto].Nombre,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal
                }).ToList()
            }, null);
        }
        catch
        {
            await transaccion.RollbackAsync();
            throw;
        }
    }
}