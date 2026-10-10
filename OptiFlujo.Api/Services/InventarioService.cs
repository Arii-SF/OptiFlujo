using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Data;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Models;

namespace OptiFlujo.Api.Services;

public class InventarioService
{
    private readonly OptiFlujoDbContext _contexto;

    public InventarioService(OptiFlujoDbContext contexto)
    {
        _contexto = contexto;
    }

    private static ProductoDto AProductoDto(Producto p) => new()
    {
        IdProducto = p.IdProducto,
        Nombre = p.Nombre,
        IdCategoria = p.IdCategoria,
        Categoria = p.Categoria?.Nombre ?? "",
        Descripcion = p.Descripcion,
        Precio = p.Precio,
        StockActual = p.StockActual,
        StockMinimo = p.StockMinimo,
        BajoPedido = p.BajoPedido,
        RequiereReorden = p.RequiereReorden()
    };

    public async Task<List<Categoria>> ListarCategoriasAsync()
        => await _contexto.Categorias.AsNoTracking()
            .Where(c => c.Activo)
            .OrderBy(c => c.Nombre)
            .ToListAsync();

    /// <summary>RF-22: filtrado por denominacion, categoria y existencia.</summary>
    public async Task<List<ProductoDto>> BuscarAsync(
        string? busqueda, int? idCategoria, bool soloBajoMinimo)
    {
        var consulta = _contexto.Productos.AsNoTracking()
            .Include(p => p.Categoria)
            .Where(p => p.Activo);

        if (!string.IsNullOrWhiteSpace(busqueda))
            consulta = consulta.Where(p => EF.Functions.Like(p.Nombre, $"%{busqueda.Trim()}%"));

        if (idCategoria is not null)
            consulta = consulta.Where(p => p.IdCategoria == idCategoria);

        // RF-24: productos que alcanzaron el nivel minimo
        if (soloBajoMinimo)
            consulta = consulta.Where(p => !p.BajoPedido && p.StockActual <= p.StockMinimo);

        var lista = await consulta.OrderBy(p => p.Nombre).ToListAsync();
        return lista.Select(AProductoDto).ToList();
    }

    public async Task<(ProductoDto? producto, string? error)> CrearAsync(
        GuardarProductoRequest peticion)
    {
        if (!await _contexto.Categorias.AnyAsync(c => c.IdCategoria == peticion.IdCategoria))
            return (null, "La categoria indicada no existe.");

        var producto = new Producto
        {
            Nombre = peticion.Nombre.Trim(),
            IdCategoria = peticion.IdCategoria,
            Descripcion = string.IsNullOrWhiteSpace(peticion.Descripcion)
                ? null : peticion.Descripcion.Trim(),
            Precio = peticion.Precio,
            StockActual = peticion.BajoPedido ? 0 : peticion.StockActual,
            StockMinimo = peticion.BajoPedido ? 0 : peticion.StockMinimo,
            BajoPedido = peticion.BajoPedido,
            Activo = true
        };

        _contexto.Productos.Add(producto);
        await _contexto.SaveChangesAsync();

        producto.Categoria = await _contexto.Categorias.FindAsync(producto.IdCategoria);
        return (AProductoDto(producto), null);
    }

    public async Task<(ProductoDto? producto, string? error)> ActualizarAsync(
        int id, GuardarProductoRequest peticion)
    {
        var producto = await _contexto.Productos
            .Include(p => p.Categoria)
            .FirstOrDefaultAsync(p => p.IdProducto == id);

        if (producto is null) return (null, "El producto no existe.");

        producto.Nombre = peticion.Nombre.Trim();
        producto.IdCategoria = peticion.IdCategoria;
        producto.Descripcion = string.IsNullOrWhiteSpace(peticion.Descripcion)
            ? null : peticion.Descripcion.Trim();
        producto.Precio = peticion.Precio;
        producto.StockActual = peticion.BajoPedido ? 0 : peticion.StockActual;
        producto.StockMinimo = peticion.BajoPedido ? 0 : peticion.StockMinimo;
        producto.BajoPedido = peticion.BajoPedido;

        await _contexto.SaveChangesAsync();

        producto.Categoria = await _contexto.Categorias.FindAsync(producto.IdCategoria);
        return (AProductoDto(producto), null);
    }

    /// <summary>
    /// RN-08: un producto con historial no se elimina, se desactiva, para
    /// conservar la trazabilidad de las transacciones que lo incluyeron.
    /// </summary>
    public async Task<bool> DesactivarAsync(int id)
    {
        var producto = await _contexto.Productos.FindAsync(id);
        if (producto is null) return false;

        producto.Activo = false;
        await _contexto.SaveChangesAsync();
        return true;
    }
}