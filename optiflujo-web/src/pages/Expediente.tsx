import { useEffect, useState } from "react";
import { obtenerExpediente } from "../api/pacientes";
import type { Expediente as Datos } from "../api/tipos";
import MarcaVigencia from "../components/MarcaVigencia";
import FormularioReceta from "../components/FormularioReceta";

interface Props {
  idPaciente: number;
  alVolver: () => void;
}

export default function Expediente({ idPaciente, alVolver }: Props) {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);

  function cargar() {
    obtenerExpediente(idPaciente)
      .then(setDatos)
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo consultar."));
  }

  useEffect(cargar, [idPaciente]);

  const fecha = (f: string) =>
    new Date(f + "T00:00:00").toLocaleDateString("es-GT",
      { day: "2-digit", month: "short", year: "numeric" });

  // Notacion habitual de la prescripcion: esfera / cilindro x eje
  const ojo = (esf: number | null, cil: number | null, eje: number | null) =>
    esf === null && cil === null ? "—"
      : `${esf ?? "—"} / ${cil ?? "—"} × ${eje ?? "—"}`;

  const moneda = (v: number) =>
    `Q ${v.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

  if (error) return <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>;
  if (!datos) return <p className="text-stone-500 text-sm">Consultando…</p>;

  return (
    <div>
      <button onClick={alVolver} className="mb-5 text-sm text-teal-700 hover:underline">
        ← Volver al listado
      </button>

      <h2 className="text-2xl font-semibold text-slate-800">{datos.nombreCompleto}</h2>
      <p className="text-stone-500 text-sm mb-6">
        {datos.edad !== null && `${datos.edad} anios · `}
        {datos.dpi ?? "sin documento"} · {datos.telefono ?? "sin telefono"}
        {datos.distanciaInterpupilar && ` · DIP ${datos.distanciaInterpupilar} mm`}
      </p>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-800">
          Historial de graduaciones
        </h3>
        {!registrando && (
          <button
            onClick={() => setRegistrando(true)}
            className="rounded-md bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white
                       hover:bg-teal-800"
          >
            Nueva graduacion
          </button>
        )}
      </div>

      {registrando && (
        <FormularioReceta
          idPaciente={idPaciente}
          alGuardar={() => {
            setRegistrando(false);
            cargar();
          }}
          alCancelar={() => setRegistrando(false)}
        />
      )}

      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        {datos.historial.length === 0 ? (
          <p className="p-8 text-center text-stone-500 text-sm">
            Este paciente aun no tiene prescripciones registradas.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-2 font-semibold">Emision</th>
                <th className="px-4 py-2 font-semibold">Ojo derecho</th>
                <th className="px-4 py-2 font-semibold">Ojo izquierdo</th>
                <th className="px-4 py-2 font-semibold">Vence</th>
                <th className="px-4 py-2 font-semibold">Estado</th>
                <th className="px-4 py-2 font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody>
              {datos.historial.map((r) => (
                <tr key={r.idReceta} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{fecha(r.fechaEmision)}</td>
                  <td className="px-4 py-3 text-stone-700 tabular-nums">
                    {ojo(r.odEsfera, r.odCilindro, r.odEje)}
                  </td>
                  <td className="px-4 py-3 text-stone-700 tabular-nums">
                    {ojo(r.oiEsfera, r.oiCilindro, r.oiEje)}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{fecha(r.fechaVencimiento)}</td>
                  <td className="px-4 py-3"><MarcaVigencia estado={r.estadoVigencia} /></td>
                  <td className="px-4 py-3 text-stone-500">{r.registradaPor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
              <h3 className="text-base font-semibold text-slate-800 mt-8 mb-3">
        Historial de compras
      </h3>

      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        {datos.compras.length === 0 ? (
          <p className="p-8 text-center text-stone-500 text-sm">
            Este paciente aun no tiene transacciones registradas.
          </p>
        ) : (
          datos.compras.map((c) => (
            <div key={c.idVenta} className="border-b border-stone-100 p-5 last:border-0">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-slate-800 font-semibold">
                  {new Date(c.fechaVenta).toLocaleDateString("es-GT",
                    { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="text-slate-800 font-semibold tabular-nums">
                  {moneda(c.total)}
                </span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {c.lineas.map((l, i) => (
                    <tr key={i}>
                      <td className="py-1 text-stone-600">{l.producto}</td>
                      <td className="py-1 text-right text-stone-500 tabular-nums">
                        {l.cantidad} × {moneda(l.precioUnitario)}
                      </td>
                      <td className="py-1 text-right text-stone-700 tabular-nums w-28">
                        {moneda(l.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-stone-400 mt-2">Atendio {c.atendidoPor}</p>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}