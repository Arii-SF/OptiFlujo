using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace OptiFlujo.Api.Data;

public class OptiFlujoDbContext : DbContext
{
    public OptiFlujoDbContext(DbContextOptions<OptiFlujoDbContext> opciones)
        : base(opciones) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<RecetaMedica> Recetas => Set<RecetaMedica>();
    public DbSet<Configuracion> Configuraciones => Set<Configuracion>();
    public DbSet<AlertaReceta> Alertas => Set<AlertaReceta>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<DetalleVenta> DetallesVenta => Set<DetalleVenta>();
    protected override void OnModelCreating(ModelBuilder modelo)
    {
        modelo.Entity<Usuario>(e =>
        {
            e.ToTable("usuarios");
            e.HasKey(x => x.IdUsuario);
            e.Property(x => x.IdUsuario).HasColumnName("id_usuario");
            e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(100);
            e.Property(x => x.Correo).HasColumnName("correo").HasMaxLength(100);
            e.Property(x => x.ContraseniaHash).HasColumnName("contrasenia_hash");
            e.Property(x => x.Rol).HasColumnName("rol").HasConversion<string>();
            e.Property(x => x.Activo).HasColumnName("activo");
            e.Property(x => x.FechaRegistro).HasColumnName("fecha_registro");
        });

        modelo.Entity<Paciente>(e =>
        {
            e.ToTable("pacientes");
            e.HasKey(x => x.IdPaciente);
            e.Property(x => x.IdPaciente).HasColumnName("id_paciente");
            e.Property(x => x.NombreCompleto).HasColumnName("nombre_completo").HasMaxLength(150);
            e.Property(x => x.Dpi).HasColumnName("dpi").HasMaxLength(13);
            e.Property(x => x.FechaNacimiento).HasColumnName("fecha_nacimiento");
            e.Property(x => x.Telefono).HasColumnName("telefono").HasMaxLength(15);
            e.Property(x => x.Correo).HasColumnName("correo").HasMaxLength(100);
            e.Property(x => x.DistanciaInterpupilar)
                .HasColumnName("distancia_interpupilar").HasPrecision(4, 1);
            e.Property(x => x.AntecedentesOculares).HasColumnName("antecedentes_oculares");
            e.Property(x => x.FechaRegistro).HasColumnName("fecha_registro");
            e.Property(x => x.Activo).HasColumnName("activo");
        });

        modelo.Entity<RecetaMedica>(e =>
        {
            e.ToTable("recetas_medicas");
            e.HasKey(x => x.IdReceta);
            e.Property(x => x.IdReceta).HasColumnName("id_receta");
            e.Property(x => x.IdPaciente).HasColumnName("id_paciente");
            e.Property(x => x.IdUsuario).HasColumnName("id_usuario");

            e.Property(x => x.OdEsfera).HasColumnName("od_esfera").HasPrecision(4, 2);
            e.Property(x => x.OdCilindro).HasColumnName("od_cilindro").HasPrecision(4, 2);
            e.Property(x => x.OdEje).HasColumnName("od_eje");
            e.Property(x => x.OdAdicion).HasColumnName("od_adicion").HasPrecision(4, 2);

            e.Property(x => x.OiEsfera).HasColumnName("oi_esfera").HasPrecision(4, 2);
            e.Property(x => x.OiCilindro).HasColumnName("oi_cilindro").HasPrecision(4, 2);
            e.Property(x => x.OiEje).HasColumnName("oi_eje");
            e.Property(x => x.OiAdicion).HasColumnName("oi_adicion").HasPrecision(4, 2);

            e.Property(x => x.FechaEmision).HasColumnName("fecha_emision");
            e.Property(x => x.FechaVencimiento).HasColumnName("fecha_vencimiento");
            e.Property(x => x.Observaciones).HasColumnName("observaciones");

            e.HasOne(x => x.Paciente)
             .WithMany(p => p.Recetas)
             .HasForeignKey(x => x.IdPaciente);

            e.HasOne(x => x.Usuario)
             .WithMany()
             .HasForeignKey(x => x.IdUsuario);
        });

        modelo.Entity<Configuracion>(e =>
        {
            e.ToTable("configuracion");
            e.HasKey(x => x.Clave);
            e.Property(x => x.Clave).HasColumnName("clave").HasMaxLength(60);
            e.Property(x => x.Valor).HasColumnName("valor").HasMaxLength(255);
            e.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(255);
            e.Property(x => x.TipoDato).HasColumnName("tipo_dato");
            e.Property(x => x.FechaModificacion).HasColumnName("fecha_modificacion");
        });

        // Proyeccion de solo lectura sobre la vista definida en el esquema
        modelo.Entity<AlertaReceta>(e =>
        {
            e.HasNoKey();
            e.ToView("v_alertas_recetas");
            e.Property(x => x.IdPaciente).HasColumnName("id_paciente");
            e.Property(x => x.NombreCompleto).HasColumnName("nombre_completo");
            e.Property(x => x.Telefono).HasColumnName("telefono");
            e.Property(x => x.IdReceta).HasColumnName("id_receta");
            e.Property(x => x.FechaEmision).HasColumnName("fecha_emision");
            e.Property(x => x.FechaVencimiento).HasColumnName("fecha_vencimiento");
            e.Property(x => x.DiasRestantes).HasColumnName("dias_restantes");
            e.Property(x => x.EstadoVigencia).HasColumnName("estado_vigencia");
        });

        modelo.Entity<Categoria>(e =>
        {
            e.ToTable("categorias");
            e.HasKey(x => x.IdCategoria);
            e.Property(x => x.IdCategoria).HasColumnName("id_categoria");
            e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(50);
            e.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(255);
            e.Property(x => x.Activo).HasColumnName("activo");
        });

        modelo.Entity<Producto>(e =>
        {
            e.ToTable("productos");
            e.HasKey(x => x.IdProducto);
            e.Property(x => x.IdProducto).HasColumnName("id_producto");
            e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(150);
            e.Property(x => x.IdCategoria).HasColumnName("id_categoria");
            e.Property(x => x.Descripcion).HasColumnName("descripcion");
            e.Property(x => x.Precio).HasColumnName("precio").HasPrecision(10, 2);
            e.Property(x => x.StockActual).HasColumnName("stock_actual");
            e.Property(x => x.StockMinimo).HasColumnName("stock_minimo");
            e.Property(x => x.BajoPedido).HasColumnName("bajo_pedido");
            e.Property(x => x.Activo).HasColumnName("activo");

            e.HasOne(x => x.Categoria)
             .WithMany()
             .HasForeignKey(x => x.IdCategoria);
        });

        modelo.Entity<Venta>(e =>
        {
            e.ToTable("ventas");
            e.HasKey(x => x.IdVenta);
            e.Property(x => x.IdVenta).HasColumnName("id_venta");
            e.Property(x => x.IdPaciente).HasColumnName("id_paciente");
            e.Property(x => x.IdUsuario).HasColumnName("id_usuario");
            e.Property(x => x.FechaVenta).HasColumnName("fecha_venta");
            e.Property(x => x.Subtotal).HasColumnName("subtotal").HasPrecision(10, 2);
            e.Property(x => x.Total).HasColumnName("total").HasPrecision(10, 2);

            e.HasOne(x => x.Paciente).WithMany().HasForeignKey(x => x.IdPaciente);
            e.HasMany(x => x.Detalles).WithOne().HasForeignKey(x => x.IdVenta);
        });

        modelo.Entity<DetalleVenta>(e =>
        {
            e.ToTable("detalle_ventas");
            e.HasKey(x => x.IdDetalle);
            e.Property(x => x.IdDetalle).HasColumnName("id_detalle");
            e.Property(x => x.IdVenta).HasColumnName("id_venta");
            e.Property(x => x.IdProducto).HasColumnName("id_producto");
            e.Property(x => x.IdReceta).HasColumnName("id_receta");
            e.Property(x => x.Cantidad).HasColumnName("cantidad");
            e.Property(x => x.PrecioUnitario).HasColumnName("precio_unitario").HasPrecision(10, 2);
            e.Property(x => x.Subtotal).HasColumnName("subtotal").HasPrecision(10, 2);

            e.HasOne(x => x.Producto).WithMany().HasForeignKey(x => x.IdProducto);
        });
    }
}