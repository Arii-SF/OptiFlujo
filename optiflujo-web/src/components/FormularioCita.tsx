import { useEffect, useState } from "react";
import { agendarCita, reprogramarCita } from "../api/citas";
import { listarPacientes } from "../api/pacientes";
import type { Cita, GuardarCita, PacienteLista } from "../api/tipos";

interface Props {
  cita?: Cita | null;
  fechaSugerida?: string;
  alGuardar: () => void;
  alCancelar: () => void;
}

const TIPOS = [
  "Examen optometrico",
  "Control de rutina",
  "Entrega de lentes",
  "Ajuste de montura",
];

export default function FormularioCita({
  cita, fechaSugerida, alGuardar, alCancelar,
}: Props) {
  const [pacientes, setPacientes] = useState<PacienteLista[]>([]);
  const [campos, setCampos] = useState({
    idPaciente: cita ? String(cita.idPaciente) : "",
    // El control de fecha y hora admite 16 caracteres: AAAA-MM-DDTHH:mm
    fechaHora: cita ? cita.fechaHora.slice(0, 16) : (fechaSugerida ?? ""),
    tipoAtencion: cita?.tipoAtencion ?? TIPOS[0],
    notas: cita?.notas ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    listarPacientes().then(setPacientes).catch(() => {});
  }, []);

  const cambiar = (nombre: string, valor: string) =>
    setCampos((previo) => ({ ...previo, [nombre]: valor }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();

    if (!campos.idPaciente) return setError("Seleccione un paciente.");
    if (!campos.fechaHora) return setError("Indique la fecha y la hora.");

    setError(null);
    setGuardando(true);

    const datos: GuardarCita = {
      idPaciente: Number(campos.idPaciente),
      fechaHora: `${campos.fechaHora}:00`,
      tipoAtencion: campos.tipoAtencion,
      notas: campos.notas.trim() || null,
    };

    try {
      if (cita) await reprogramarCita(cita.idCita, datos);
      else await agendarCita(datos);
      alGuardar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="rounded-lg border border-stone-200 bg-white p-5 mb-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        {cita ? "Reprogramar cita" : "Nueva cita"}
      </h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <label className="block text-xs text-stone-500 mb-1">Paciente</label>
          <select
            value={campos.idPaciente}
            onChange={(e) => cambiar("idPaciente", e.target.value)}
            disabled={!!cita}
            className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                       disabled:bg-stone-50 disabled:text-stone-500
                       focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="">Seleccione…</option>
            {pacientes.map((p) => (
              <option key={p.idPaciente} value={p.idPaciente}>{p.nombreCompleto}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Fecha y hora</label>
          <input
            type="datetime-local"
            required
            value={campos.fechaHora}
            onChange={(e) => cambiar("fechaHora", e.target.value)}
            className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Tipo de atencion</label>
          <select
            value={campos.tipoAtencion}
            onChange={(e) => cambiar("tipoAtencion", e.target.value)}
            className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <label className="block text-xs text-stone-500 mb-1">Notas</label>
      <textarea
        value={campos.notas}
        onChange={(e) => cambiar("notas", e.target.value)}
        rows={2}
        className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm mb-4
                   focus:outline-none focus:ring-2 focus:ring-teal-600"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-teal-800 disabled:opacity-50"
        >
          {guardando ? "Guardando…" : cita ? "Reprogramar" : "Agendar"}
        </button>
        <button
          type="button"
          onClick={alCancelar}
          className="rounded-md border border-stone-300 px-4 py-2 text-sm text-slate-700
                     hover:bg-stone-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}