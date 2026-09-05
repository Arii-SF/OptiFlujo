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
                .ToList()
        };
    }
}