import { useEffect, useState } from "react";
import { listarCitas, cambiarEstadoCita } from "../api/citas";
import type { Cita, EstadoCita } from "../api/tipos";
import FormularioCita from "../components/FormularioCita";

const ETIQUETAS: Record<EstadoCita, string> = {
  PROGRAMADA: "Programada",
  CONFIRMADA: "Confirmada",
  EN_ATENCION: "En atencion",
  ATENDIDA: "Atendida",
  CANCELADA_PACIENTE: "Cancelo el paciente",
  CANCELADA_ESTABLECIMIENTO: "Cancelo el establecimiento",
  AUSENTE: "Inasistencia",
};

// Los colores corresponden a los del diagrama de estados de la cita
const COLORES: Record<EstadoCita, string> = {
  PROGRAMADA: "bg-sky-50 text-sky-800 border-sky-200",
  CONFIRMADA: "bg-teal-50 text-teal-800 border-teal-200",
  EN_ATENCION: "bg-amber-50 text-amber-800 border-amber-200",
  ATENDIDA: "bg-teal-50 text-teal-800 border-teal-200",
  CANCELADA_PACIENTE: "bg-red-50 text-red-800 border-red-200",
  CANCELADA_ESTABLECIMIENTO: "bg-red-50 text-red-800 border-red-200",
  AUSENTE: "bg-stone-100 text-stone-500 border-stone-200",
};

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

function inicioDeSemana(dia: Date) {
  const d = new Date(dia);
  const desplazamiento = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - desplazamiento);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Agenda() {
  const [semana, setSemana] = useState(() => inicioDeSemana(new Date()));
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [reprogramando, setReprogramando] = useState<Cita | null>(null);

  async function consultar() {
    setCargando(true);
    setError(null);
    const fin = new Date(semana);
    fin.setDate(fin.getDate() + 7);

    try {
      setCitas(await listarCitas(semana, fin));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo consultar.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { consultar(); }, [semana]);

  async function moverEstado(cita: Cita, estado: string) {
    try {
      await cambiarEstadoCita(cita.idCita, estado);
      consultar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar.");
    }
  }

  function mover(dias: number) {
    const d = new Date(semana);
    d.setDate(d.getDate() + dias);
    setSemana(d);
  }

  const hoy = new Date();
  const esHoy = (d: Date) => d.toDateString() === hoy.toDateString();

  const dias = DIAS.map((nombre, i) => {
    const fecha = new Date(semana);
    fecha.setDate(fecha.getDate() + i);
    return {
      nombre,
      fecha,
      citas: citas
        .filter((c) => new Date(c.fechaHora).toDateString() === fecha.toDateString())
        .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
    };
  });

  const rotulo = `${semana.toLocaleDateString("es-GT", { day: "2-digit", month: "short" })} – ` +
    `${dias[5].fecha.toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" })}`;

  function cerrar() {
    setCreando(false);
    setReprogramando(null);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">Agenda</h2>
      <p className="text-stone-500 text-sm mb-6">
        Citas programadas de la semana, de lunes a sabado.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => mover(-7)}
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm
                       text-slate-700 hover:bg-stone-50"
          >
            ←
          </button>
          <button
            onClick={() => setSemana(inicioDeSemana(new Date()))}
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm
                       text-slate-700 hover:bg-stone-50"
          >
            Esta semana
          </button>
          <button
            onClick={() => mover(7)}
            className="rounded-md border border-stone-300 px-3 py-1.5 text-sm
                       text-slate-700 hover:bg-stone-50"
          >
            →
          </button>
          <span className="ml-2 text-sm text-stone-600">{rotulo}</span>
        </div>

        {!creando && !reprogramando && (
          <button
            onClick={() => setCreando(true)}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white
                       hover:bg-teal-800"
          >
            Nueva cita
          </button>
        )}
      </div>

      {(creando || reprogramando) && (
        <FormularioCita
          cita={reprogramando}
          alGuardar={() => { cerrar(); consultar(); }}
          alCancelar={cerrar}
        />
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">{error}</div>
      )}

      {cargando ? (
        <p className="p-8 text-center text-stone-500 text-sm">Consultando…</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {dias.map((d) => (
            <div key={d.nombre} className="rounded-lg border border-stone-200 bg-white">
              <div className={`border-b px-3 py-2 ${esHoy(d.fecha)
                ? "border-teal-200 bg-teal-50" : "border-stone-200"}`}>
                <p className={`text-sm font-semibold ${esHoy(d.fecha)
                  ? "text-teal-800" : "text-slate-800"}`}>{d.nombre}</p>
                <p className="text-xs text-stone-500">
                  {d.fecha.toLocaleDateString("es-GT", { day: "2-digit", month: "short" })}
                </p>
              </div>

              <div className="p-2 space-y-2 min-h-24">
                {d.citas.length === 0 ? (
                  <p className="py-6 text-center text-xs text-stone-400">Sin citas</p>
                ) : (
                  d.citas.map((c) => (
                    <div
                      key={c.idCita}
                      className={`rounded-md border p-2.5 text-xs ${COLORES[c.estado]}`}
                    >
                      <p className="font-semibold tabular-nums">
                        {new Date(c.fechaHora).toLocaleTimeString("es-GT",
                          { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="font-medium">{c.paciente}</p>
                      <p className="opacity-75">{c.tipoAtencion}</p>
                      {c.notas && <p className="mt-1 opacity-60">{c.notas}</p>}

                      <select
                        value={c.estado}
                        onChange={(e) => moverEstado(c, e.target.value)}
                        className="mt-2 w-full rounded border border-current bg-white/60
                                   px-1 py-0.5 text-xs"
                      >
                        {(Object.keys(ETIQUETAS) as EstadoCita[]).map((e) => (
                          <option key={e} value={e}>{ETIQUETAS[e]}</option>
                        ))}
                      </select>

                      {(c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA") && (
                        <button
                          onClick={() => { setReprogramando(c); setCreando(false); }}
                          className="mt-1 w-full rounded border border-current bg-white/60
                                     px-1 py-0.5 text-xs hover:bg-white"
                        >
                          Reprogramar
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}