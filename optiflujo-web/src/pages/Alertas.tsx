import { useEffect, useState } from "react";
import { listarAlertas } from "../api/alertas";
import type { Alerta } from "../api/tipos";
import MarcaVigencia from "../components/MarcaVigencia";

const FILTROS = [
  { valor: "", etiqueta: "Todas" },
  { valor: "PROXIMA_A_VENCER", etiqueta: "Proximas a vencer" },
  { valor: "VENCIDA", etiqueta: "Vencidas" },
];

export default function Alertas() {
  const [lista, setLista] = useState<Alerta[]>([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    listarAlertas(filtro || undefined)
      .then(setLista)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo consultar."))
      .finally(() => setCargando(false));
  }, [filtro]);

  const fecha = (f: string) =>
    new Date(f + "T00:00:00").toLocaleDateString("es-GT",
      { day: "2-digit", month: "short", year: "numeric" });

  // Un valor negativo indica que la prescripcion ya vencio
  const plazo = (dias: number) =>
    dias < 0 ? `hace ${Math.abs(dias)} dias` : `en ${dias} dias`;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">Alertas de vigencia</h2>
      <p className="text-stone-500 text-sm mb-6">
        Prescripciones que requieren una nueva evaluacion.
      </p>

      <div className="flex gap-2 mb-6">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              filtro === f.valor
                ? "bg-slate-800 text-white font-semibold"
                : "border border-stone-300 text-slate-700 hover:bg-stone-50"
            }`}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        {cargando ? (
          <p className="p-8 text-center text-stone-500 text-sm">Consultando…</p>
        ) : lista.length === 0 ? (
          <p className="p-8 text-center text-stone-500 text-sm">
            No hay prescripciones pendientes en este filtro.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-2 font-semibold">Paciente</th>
                <th className="px-4 py-2 font-semibold">Telefono</th>
                <th className="px-4 py-2 font-semibold">Emision</th>
                <th className="px-4 py-2 font-semibold">Vencimiento</th>
                <th className="px-4 py-2 font-semibold">Plazo</th>
                <th className="px-4 py-2 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.idReceta} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{a.nombreCompleto}</td>
                  <td className="px-4 py-3 text-stone-600">{a.telefono ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{fecha(a.fechaEmision)}</td>
                  <td className="px-4 py-3 text-stone-600">{fecha(a.fechaVencimiento)}</td>
                  <td className="px-4 py-3 text-stone-600">{plazo(a.diasRestantes)}</td>
                  <td className="px-4 py-3"><MarcaVigencia estado={a.estadoVigencia} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}