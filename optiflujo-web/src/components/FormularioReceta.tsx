import { useState } from "react";
import { crearReceta } from "../api/pacientes";
import type { NuevaReceta } from "../api/tipos";

interface Props {
  idPaciente: number;
  alGuardar: () => void;
  alCancelar: () => void;
}

const VACIO = {
  odEsfera: "", odCilindro: "", odEje: "", odAdicion: "",
  oiEsfera: "", oiCilindro: "", oiEje: "", oiAdicion: "",
  observaciones: "",
};

export default function FormularioReceta({ idPaciente, alGuardar, alCancelar }: Props) {
  const [campos, setCampos] = useState(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (nombre: string, valor: string) =>
    setCampos((previo) => ({ ...previo, [nombre]: valor }));

  // Un campo vacio se envia como nulo; la API distingue ausencia de cero
  const numero = (v: string) => (v.trim() === "" ? null : Number(v));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const datos: NuevaReceta = {
      idPaciente,
      odEsfera: numero(campos.odEsfera),
      odCilindro: numero(campos.odCilindro),
      odEje: numero(campos.odEje),
      odAdicion: numero(campos.odAdicion),
      oiEsfera: numero(campos.oiEsfera),
      oiCilindro: numero(campos.oiCilindro),
      oiEje: numero(campos.oiEje),
      oiAdicion: numero(campos.oiAdicion),
      observaciones: campos.observaciones.trim() || null,
    };

    try {
      await crearReceta(datos);
      alGuardar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar.");
    } finally {
      setGuardando(false);
    }
  }

  const campo = (nombre: keyof typeof VACIO, etiqueta: string, paso = "0.25") => (
    <div>
      <label className="block text-xs text-stone-500 mb-1">{etiqueta}</label>
      <input
        type="number"
        step={paso}
        value={campos[nombre]}
        onChange={(e) => cambiar(nombre, e.target.value)}
        className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm tabular-nums
                   focus:outline-none focus:ring-2 focus:ring-teal-600"
      />
    </div>
  );

  return (
    <form onSubmit={enviar} className="rounded-lg border border-stone-200 bg-white p-5 mb-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Nueva graduacion</h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <p className="text-xs font-semibold text-stone-600 mb-2">Ojo derecho</p>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {campo("odEsfera", "Esfera")}
        {campo("odCilindro", "Cilindro")}
        {campo("odEje", "Eje", "1")}
        {campo("odAdicion", "Adicion")}
      </div>

      <p className="text-xs font-semibold text-stone-600 mb-2">Ojo izquierdo</p>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {campo("oiEsfera", "Esfera")}
        {campo("oiCilindro", "Cilindro")}
        {campo("oiEje", "Eje", "1")}
        {campo("oiAdicion", "Adicion")}
      </div>

      <label className="block text-xs text-stone-500 mb-1">Observaciones</label>
      <textarea
        value={campos.observaciones}
        onChange={(e) => cambiar("observaciones", e.target.value)}
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
          {guardando ? "Guardando…" : "Registrar"}
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