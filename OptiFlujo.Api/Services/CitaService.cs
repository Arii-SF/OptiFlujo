using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Data;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Models;

namespace OptiFlujo.Api.Services;

public class CitaService
{
    private readonly OptiFlujoDbContext _contexto;

    public CitaService(OptiFlujoDbContext contexto)
    {
        _contexto = contexto;
    }

    private static CitaDto ACitaDto(Cita c) => new()
    {
        IdCita = c.IdCita,
        IdPaciente = c.IdPaciente,
        Paciente = c.Paciente?.NombreCompleto ?? "—",
        Telefono = c.Paciente?.Telefono,
        FechaHora = c.FechaHora,
        TipoAtencion = c.TipoAtencion,
        Estado = c.Estado,
        Notas = c.Notas
    };

    /// <summary>
    /// RN-04. Solo cuentan las citas que ocupan el horario: una cancelacion
    /// o una inasistencia lo liberan y permiten reasignarlo.
    /// </summary>
    private async Task<bool> HayConflictoAsync(DateTime fechaHora, int? idExcluida = null)
        => await _contexto.Citas.AnyAsync(c =>
               c.FechaHora == fechaHora &&
               !Cita.EstadosLiberadores.Contains(c.Estado) &&
               (idExcluida == null || c.IdCita != idExcluida));

    /// <summary>RF-15: citas de un periodo, para la vista semanal.</summary>
    public async Task<List<CitaDto>> ObtenerPorRangoAsync(DateTime desde, DateTime hasta)
    {
        var citas = await _contexto.Citas
            .AsNoTracking()
            .Include(c => c.Paciente)
            .Where(c => c.FechaHora >= desde && c.FechaHora < hasta)
            .OrderBy(c => c.FechaHora)
            .ToListAsync();

        return citas.Select(ACitaDto).ToList();
    }

    /// <summary>RF-13 y RF-14: registro de cita con validacion de horario.</summary>
    public async Task<(CitaDto? cita, string? error)> AgendarAsync(
        GuardarCitaRequest peticion, int idUsuario)
    {
        var paciente = await _contexto.Pacientes
            .FirstOrDefaultAsync(p => p.IdPaciente == peticion.IdPaciente);

        if (paciente is null) return (null, "El paciente indicado no existe.");

        if (peticion.FechaHora < DateTime.Now.AddMinutes(-5))
            return (null, "No puede agendarse una cita en una fecha pasada.");

        if (await HayConflictoAsync(peticion.FechaHora))
            return (null, "Ya existe una cita registrada en ese horario.");

        var cita = new Cita
        {
            IdPaciente = peticion.IdPaciente,
            IdUsuario = idUsuario,
            FechaHora = peticion.FechaHora,
            TipoAtencion = peticion.TipoAtencion.Trim(),
            Estado = "PROGRAMADA",
            Notas = string.IsNullOrWhiteSpace(peticion.Notas) ? null : peticion.Notas.Trim(),
            FechaRegistro = DateTime.Now
        };

        _contexto.Citas.Add(cita);
        await _contexto.SaveChangesAsync();

        cita.Paciente = paciente;
        return (ACitaDto(cita), null);
    }

    /// <summary>RF-16: reprogramacion, con nueva validacion de horario.</summary>
    public async Task<(CitaDto? cita, string? error)> ReprogramarAsync(
        int id, GuardarCitaRequest peticion)
    {
        var cita = await _contexto.Citas
            .Include(c => c.Paciente)
            .FirstOrDefaultAsync(c => c.IdCita == id);

        if (cita is null) return (null, "La cita no existe.");

        if (cita.Estado is not ("PROGRAMADA" or "CONFIRMADA"))
            return (null, "Solo puede reprogramarse una cita programada o confirmada.");

        if (await HayConflictoAsync(peticion.FechaHora, id))
            return (null, "Ya existe otra cita registrada en ese horario.");

        cita.FechaHora = peticion.FechaHora;
        cita.TipoAtencion = peticion.TipoAtencion.Trim();
        cita.Notas = string.IsNullOrWhiteSpace(peticion.Notas) ? null : peticion.Notas.Trim();

        await _contexto.SaveChangesAsync();
        return (ACitaDto(cita), null);
    }

    /// <summary>RF-17: cambio de estado conforme al diagrama H2.</summary>
    public async Task<string?> CambiarEstadoAsync(int id, string estado)
    {
        if (!Cita.Estados.Contains(estado))
            return "El estado indicado no es valido.";

        var cita = await _contexto.Citas.FirstOrDefaultAsync(c => c.IdCita == id);
        if (cita is null) return "La cita no existe.";

        cita.Estado = estado;
        await _contexto.SaveChangesAsync();
        return null;
    }
}