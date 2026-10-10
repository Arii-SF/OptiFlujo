using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Data;
using OptiFlujo.Api.DTOs;
using OptiFlujo.Api.Models;
using System.Globalization;

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

        var fueraDeHorario = await FueraDeHorarioAsync(peticion.FechaHora);
        if (fueraDeHorario is not null) return (null, fueraDeHorario);

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

        var fueraDeHorario = await FueraDeHorarioAsync(peticion.FechaHora);
        if (fueraDeHorario is not null) return (null, fueraDeHorario);

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

    /// <summary>
    /// RNF-12: la cita debe caer dentro del horario de atencion. Los horarios
    /// se leen de la configuracion, de modo que un establecimiento con otra
    /// jornada no requiere modificar el codigo.
    /// </summary>
    private async Task<string?> FueraDeHorarioAsync(DateTime fechaHora)
    {
        var config = await _contexto.Configuraciones
            .Where(c => c.Clave.StartsWith("horario_") || c.Clave == "atiende_domingo")
            .ToDictionaryAsync(c => c.Clave, c => c.Valor);

        string Valor(string clave, string porDefecto)
            => config.TryGetValue(clave, out var v) ? v : porDefecto;

        static TimeOnly Hora(string texto) =>
            TimeOnly.TryParse(texto, CultureInfo.InvariantCulture, out var t)
                ? t : new TimeOnly(9, 0);

        var dia = fechaHora.DayOfWeek;

        if (dia == DayOfWeek.Sunday && Valor("atiende_domingo", "false") != "true")
            return "El establecimiento no atiende los domingos.";

        var esSabado = dia == DayOfWeek.Saturday;
        var apertura = Hora(Valor(esSabado ? "horario_apertura_sabado" : "horario_apertura_semana", "09:00"));
        var cierre = Hora(Valor(esSabado ? "horario_cierre_sabado" : "horario_cierre_semana", "18:00"));

        var hora = TimeOnly.FromDateTime(fechaHora);

        if (hora < apertura || hora >= cierre)
            return $"Ese dia el horario de atencion es de {apertura:HH\\:mm} a {cierre:HH\\:mm}.";

        return null;
    }
}