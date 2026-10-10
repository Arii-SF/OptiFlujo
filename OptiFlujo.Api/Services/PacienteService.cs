using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Data;
using OptiFlujo.Api.DTOs;

namespace OptiFlujo.Api.Services;

public class PacienteService
{
    private readonly OptiFlujoDbContext _contexto;

    public PacienteService(OptiFlujoDbContext contexto)
    {
        _contexto = contexto;
    }

    // RN-02: el umbral de alerta se lee de la configuracion, no del codigo.
    private async Task<int> UmbralAlertaAsync()
    {
        var valor = await _contexto.Configuraciones
            .Where(c => c.Clave == "alerta_dias_previos")
            .Select(c => c.Valor)
            .FirstOrDefaultAsync();

        return int.TryParse(valor, out var dias) ? dias : 30;
    }

    private static string Clasificar(DateOnly vencimiento, DateOnly hoy, int umbral)
    {
        if (vencimiento < hoy) return "VENCIDA";
        return (vencimiento.DayNumber - hoy.DayNumber) <= umbral
            ? "PROXIMA_A_VENCER"
            : "VIGENTE";
    }

    /// <summary>RF-06: listado con busqueda por nombre o documento.</summary>
    public async Task<List<PacienteListaDto>> BuscarAsync(string? busqueda)
    {
        var hoy = DateOnly.FromDateTime(DateTime.Today);
        var umbral = await UmbralAlertaAsync();

        var consulta = _contexto.Pacientes.Where(p => p.Activo);

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var patron = $"%{busqueda.Trim()}%";
            consulta = consulta.Where(p =>
                EF.Functions.Like(p.NombreCompleto, patron) ||
                (p.Dpi != null && EF.Functions.Like(p.Dpi, patron)));
        }

        var lista = await consulta
            .OrderBy(p => p.NombreCompleto)
            .Select(p => new
            {
                p.IdPaciente,
                p.NombreCompleto,
                p.Dpi,
                p.Telefono,
                Ultima = p.Recetas
                    .OrderByDescending(r => r.FechaEmision)
                    .Select(r => (DateOnly?)r.FechaVencimiento)
                    .FirstOrDefault(),
                Emision = p.Recetas
                    .OrderByDescending(r => r.FechaEmision)
                    .Select(r => (DateOnly?)r.FechaEmision)
                    .FirstOrDefault()
            })
            .Take(100)
            .ToListAsync();

        return lista.Select(p => new PacienteListaDto
        {
            IdPaciente = p.IdPaciente,
            NombreCompleto = p.NombreCompleto,
            Dpi = p.Dpi,
            Telefono = p.Telefono,
            UltimaReceta = p.Emision,
            EstadoVigencia = p.Ultima is null
                ? "SIN_RECETA"
                : Clasificar(p.Ultima.Value, hoy, umbral)
        }).ToList();
    }

    /// <summary>RF-07: expediente con el historial cronologico.</summary>
    public async Task<ExpedienteDto?> ObtenerExpedienteAsync(int id)
    {
        var hoy = DateOnly.FromDateTime(DateTime.Today);
        var umbral = await UmbralAlertaAsync();

        var paciente = await _contexto.Pacientes
            .Include(p => p.Recetas)
            .FirstOrDefaultAsync(p => p.IdPaciente == id);

        if (paciente is null) return null;

        var nombres = await _contexto.Usuarios
            .ToDictionaryAsync(u => u.IdUsuario, u => u.Nombre);
        // Transacciones del paciente, de la mas reciente a la mas antigua
        var ventas = await _contexto.Ventas
            .AsNoTracking()
            .Include(v => v.Detalles).ThenInclude(d => d.Producto)
            .Where(v => v.IdPaciente == id)
            .OrderByDescending(v => v.FechaVenta)
            .ToListAsync();

        int? edad = null;
        if (paciente.FechaNacimiento is not null)
        {
            edad = hoy.Year - paciente.FechaNacimiento.Value.Year;
            if (paciente.FechaNacimiento.Value > hoy.AddYears(-edad.Value)) edad--;
        }

        return new ExpedienteDto
        {
            IdPaciente = paciente.IdPaciente,
            NombreCompleto = paciente.NombreCompleto,
            Dpi = paciente.Dpi,
            FechaNacimiento = paciente.FechaNacimiento,
            Edad = edad,
            Telefono = paciente.Telefono,
            Correo = paciente.Correo,
            DistanciaInterpupilar = paciente.DistanciaInterpupilar,
            AntecedentesOculares = paciente.AntecedentesOculares,
            Historial = paciente.Recetas
                .OrderByDescending(r => r.FechaEmision)
                .Select(r => new RecetaDto
                {
                    IdReceta = r.IdReceta,
                    OdEsfera = r.OdEsfera,
                    OdCilindro = r.OdCilindro,
                    OdEje = r.OdEje,
                    OdAdicion = r.OdAdicion,
                    OiEsfera = r.OiEsfera,
                    OiCilindro = r.OiCilindro,
                    OiEje = r.OiEje,
                    OiAdicion = r.OiAdicion,
                    FechaEmision = r.FechaEmision,
                    FechaVencimiento = r.FechaVencimiento,
                    DiasParaVencer = r.DiasParaVencer(hoy),
                    EstadoVigencia = Clasificar(r.FechaVencimiento, hoy, umbral),
                    Observaciones = r.Observaciones,
                    RegistradaPor = nombres.GetValueOrDefault(r.IdUsuario, "—")
                })
                .ToList(),

            Compras = ventas.Select(v => new VentaResumenDto
            {
                IdVenta = v.IdVenta,
                FechaVenta = v.FechaVenta,
                Total = v.Total,
                AtendidoPor = nombres.GetValueOrDefault(v.IdUsuario, "—"),
                Lineas = v.Detalles.Select(d => new LineaVentaDto
                {
                    Producto = d.Producto?.Nombre ?? "—",
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal
                }).ToList()
            }).ToList()
        };
    }

    /// <summary>
    /// RF-09. La fecha de vencimiento se calcula sumando a la emision los
    /// meses definidos en la configuracion, conforme a RN-01.
    /// </summary>
    public async Task<(RecetaDto? receta, string? error)> CrearRecetaAsync(
        CrearRecetaRequest peticion, int idUsuario)
    {
        var paciente = await _contexto.Pacientes
            .FirstOrDefaultAsync(p => p.IdPaciente == peticion.IdPaciente);

        if (paciente is null)
            return (null, "El paciente indicado no existe.");

        if (peticion.OdEsfera is null && peticion.OiEsfera is null)
            return (null, "Debe registrar la graduacion de al menos un ojo.");

        var vigenciaTexto = await _contexto.Configuraciones
            .Where(c => c.Clave == "receta_vigencia_meses")
            .Select(c => c.Valor)
            .FirstOrDefaultAsync();

        var meses = int.TryParse(vigenciaTexto, out var m) ? m : 12;

        var hoy = DateOnly.FromDateTime(DateTime.Today);

        var receta = new Models.RecetaMedica
        {
            IdPaciente = peticion.IdPaciente,
            IdUsuario = idUsuario,
            OdEsfera = peticion.OdEsfera,
            OdCilindro = peticion.OdCilindro,
            OdEje = peticion.OdEje,
            OdAdicion = peticion.OdAdicion,
            OiEsfera = peticion.OiEsfera,
            OiCilindro = peticion.OiCilindro,
            OiEje = peticion.OiEje,
            OiAdicion = peticion.OiAdicion,
            FechaEmision = hoy,
            FechaVencimiento = hoy.AddMonths(meses),
            Observaciones = peticion.Observaciones
        };

        _contexto.Recetas.Add(receta);
        await _contexto.SaveChangesAsync();

        var umbral = await UmbralAlertaAsync();
        var autor = await _contexto.Usuarios
            .Where(u => u.IdUsuario == idUsuario)
            .Select(u => u.Nombre)
            .FirstOrDefaultAsync() ?? "—";

        return (new RecetaDto
        {
            IdReceta = receta.IdReceta,
            OdEsfera = receta.OdEsfera,
            OdCilindro = receta.OdCilindro,
            OdEje = receta.OdEje,
            OdAdicion = receta.OdAdicion,
            OiEsfera = receta.OiEsfera,
            OiCilindro = receta.OiCilindro,
            OiEje = receta.OiEje,
            OiAdicion = receta.OiAdicion,
            FechaEmision = receta.FechaEmision,
            FechaVencimiento = receta.FechaVencimiento,
            DiasParaVencer = receta.DiasParaVencer(hoy),
            EstadoVigencia = Clasificar(receta.FechaVencimiento, hoy, umbral),
            Observaciones = receta.Observaciones,
            RegistradaPor = autor
        }, null);
    }

    /// <summary>RF-05: alta de paciente.</summary>
    public async Task<(PacienteListaDto? paciente, string? error)> CrearAsync(
        CrearPacienteRequest peticion)
    {
        var nombre = peticion.NombreCompleto.Trim();

        if (nombre.Length < 3)
            return (null, "El nombre no es valido.");

        var dpi = string.IsNullOrWhiteSpace(peticion.Dpi) ? null : peticion.Dpi.Trim();

        // El documento es opcional, pero no puede repetirse entre pacientes
        if (dpi is not null && await _contexto.Pacientes.AnyAsync(p => p.Dpi == dpi))
            return (null, "Ya existe un paciente registrado con ese documento.");

        var paciente = new Models.Paciente
        {
            NombreCompleto = nombre,
            Dpi = dpi,
            FechaNacimiento = peticion.FechaNacimiento,
            Telefono = string.IsNullOrWhiteSpace(peticion.Telefono) ? null : peticion.Telefono.Trim(),
            Correo = string.IsNullOrWhiteSpace(peticion.Correo) ? null : peticion.Correo.Trim(),
            DistanciaInterpupilar = peticion.DistanciaInterpupilar,
            AntecedentesOculares = string.IsNullOrWhiteSpace(peticion.AntecedentesOculares)
                ? null : peticion.AntecedentesOculares.Trim(),
            Activo = true
        };

        _contexto.Pacientes.Add(paciente);
        await _contexto.SaveChangesAsync();

        return (new PacienteListaDto
        {
            IdPaciente = paciente.IdPaciente,
            NombreCompleto = paciente.NombreCompleto,
            Dpi = paciente.Dpi,
            Telefono = paciente.Telefono,
            UltimaReceta = null,
            EstadoVigencia = "SIN_RECETA"
        }, null);
    }

    /// <summary>
    /// RF-08: actualizacion de los datos del paciente. Se reutiliza el DTO del
    /// alta porque los campos admitidos son los mismos.
    /// </summary>
    public async Task<string?> ActualizarAsync(int id, CrearPacienteRequest peticion)
    {
        var paciente = await _contexto.Pacientes
            .FirstOrDefaultAsync(p => p.IdPaciente == id);

        if (paciente is null) return "El paciente no existe.";

        var nombre = peticion.NombreCompleto.Trim();
        if (nombre.Length < 3) return "El nombre no es valido.";

        var dpi = string.IsNullOrWhiteSpace(peticion.Dpi) ? null : peticion.Dpi.Trim();

        // El documento sigue siendo unico, excluyendo al propio paciente
        if (dpi is not null &&
            await _contexto.Pacientes.AnyAsync(p => p.Dpi == dpi && p.IdPaciente != id))
            return "Ya existe otro paciente registrado con ese documento.";

        paciente.NombreCompleto = nombre;
        paciente.Dpi = dpi;
        paciente.FechaNacimiento = peticion.FechaNacimiento;
        paciente.Telefono = string.IsNullOrWhiteSpace(peticion.Telefono)
            ? null : peticion.Telefono.Trim();
        paciente.Correo = string.IsNullOrWhiteSpace(peticion.Correo)
            ? null : peticion.Correo.Trim();
        paciente.DistanciaInterpupilar = peticion.DistanciaInterpupilar;
        paciente.AntecedentesOculares = string.IsNullOrWhiteSpace(peticion.AntecedentesOculares)
            ? null : peticion.AntecedentesOculares.Trim();

        await _contexto.SaveChangesAsync();
        return null;
    }
}