import { useEffect, useState } from "react";
import { listarPacientes } from "../api/pacientes";
import type { PacienteLista } from "../api/tipos";
import MarcaVigencia from "../components/MarcaVigencia";
import FormularioPaciente from "../components/FormularioPaciente";

interface Props {
  alAbrirExpediente: (id: number) => void;
}

export default function Pacientes({ alAbrirExpediente }: Props) {
  const [lista, setLista] = useState<PacienteLista[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);

  async function buscar(termino: string) {
    setCargando(true);
    setError(null);
    try {
      setLista(await listarPacientes(termino));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo consultar.");
    } finally {
      setCargando(false);
    }
  }

  // Espera breve antes de consultar, para no llamar a la API en cada tecla
  useEffect(() => {
    const t = setTimeout(() => buscar(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const fecha = (f: string | null) =>
    f ? new Date(f + "T00:00:00").toLocaleDateString("es-GT",
        { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">Pacientes</h2>
      <p className="text-stone-500 text-sm mb-6">
        Busque por nombre o documento para abrir el expediente.
      </p>

      <div className="flex items-center justify-between gap-4 mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Nombre o DPI"
          className="w-full max-w-md rounded-md border border-stone-300 px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        {!registrando && (
          <button
            onClick={() => setRegistrando(true)}
            className="shrink-0 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white
                       hover:bg-teal-800"
          >
            Nuevo paciente
          </button>
        )}
      </div>

      {registrando && (
        <FormularioPaciente
          alGuardar={() => {
            setRegistrando(false);
            buscar(busqueda);
          }}
          alCancelar={() => setRegistrando(false)}
        />
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        {cargando ? (
          <p className="p-8 text-center text-stone-500 text-sm">Consultando…</p>
        ) : lista.length === 0 ? (
          <p className="p-8 text-center text-stone-500 text-sm">
            Ningún paciente coincide con la búsqueda.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-2 font-semibold">Nombre</th>
                <th className="px-4 py-2 font-semibold">DPI</th>
                <th className="px-4 py-2 font-semibold">Teléfono</th>
                <th className="px-4 py-2 font-semibold">Última receta</th>
                <th className="px-4 py-2 font-semibold">Vigencia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.idPaciente} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{p.nombreCompleto}</td>
                  <td className="px-4 py-3 text-stone-600">{p.dpi ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{p.telefono ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{fecha(p.ultimaReceta)}</td>
                  <td className="px-4 py-3"><MarcaVigencia estado={p.estadoVigencia} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => alAbrirExpediente(p.idPaciente)}
                      className="rounded-md border border-stone-300 px-3 py-1.5 text-slate-700
                                 hover:bg-stone-50"
                    >
                      Expediente
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}