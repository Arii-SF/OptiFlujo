import { useState } from "react";
import { crearPaciente, actualizarPaciente } from "../api/pacientes";
import type { NuevoPaciente, Expediente } from "../api/tipos";

interface Props {
  paciente?: Expediente | null;
  alGuardar: () => void;
  alCancelar: () => void;
}

export default function FormularioPaciente({ paciente, alGuardar, alCancelar }: Props) {
  const [campos, setCampos] = useState({
    nombreCompleto: paciente?.nombreCompleto ?? "",
    dpi: paciente?.dpi ?? "",
    fechaNacimiento: paciente?.fechaNacimiento ?? "",
    telefono: paciente?.telefono ?? "",
    correo: paciente?.correo ?? "",
    distanciaInterpupilar: paciente?.distanciaInterpupilar
      ? String(paciente.distanciaInterpupilar) : "",
    antecedentesOculares: paciente?.antecedentesOculares ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (nombre: string, valor: string) =>
    setCampos((previo) => ({ ...previo, [nombre]: valor }));

  const texto = (v: string) => (v.trim() === "" ? null : v.trim());

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const datos: NuevoPaciente = {
      nombreCompleto: campos.nombreCompleto.trim(),
      dpi: texto(campos.dpi),
      fechaNacimiento: texto(campos.fechaNacimiento),
      telefono: texto(campos.telefono),
      correo: texto(campos.correo),
      distanciaInterpupilar: campos.distanciaInterpupilar.trim() === ""
        ? null : Number(campos.distanciaInterpupilar),
      antecedentesOculares: texto(campos.antecedentesOculares),
    };

    try {
      if (paciente) await actualizarPaciente(paciente.idPaciente, datos);
      else await crearPaciente(datos);
      alGuardar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  const entrada = (
    nombre: keyof typeof campos,
    etiqueta: string,
    tipo = "text",
    extra: Record<string, unknown> = {}
  ) => (
    <div>
      <label className="block text-xs text-stone-500 mb-1">{etiqueta}</label>
      <input
        type={tipo}
        value={campos[nombre]}
        onChange={(e) => cambiar(nombre, e.target.value)}
        {...extra}
        className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-teal-600"
      />
    </div>
  );

  return (
    <form onSubmit={enviar} className="rounded-lg border border-stone-200 bg-white p-5 mb-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        {paciente ? "Editar paciente" : "Nuevo paciente"}
      </h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <label className="block text-xs text-stone-500 mb-1">Nombre completo</label>
          <input
            type="text"
            required
            value={campos.nombreCompleto}
            onChange={(e) => cambiar("nombreCompleto", e.target.value)}
            className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
        {entrada("dpi", "DPI", "text", { maxLength: 13 })}
        {entrada("fechaNacimiento", "Fecha de nacimiento", "date")}
        {entrada("telefono", "Telefono", "text", { maxLength: 15 })}
        {entrada("correo", "Correo", "email")}
        {entrada("distanciaInterpupilar", "Distancia interpupilar (mm)", "number",
          { step: "0.5", min: 40, max: 80 })}
      </div>

      <label className="block text-xs text-stone-500 mb-1">Antecedentes oculares</label>
      <textarea
        value={campos.antecedentesOculares}
        onChange={(e) => cambiar("antecedentesOculares", e.target.value)}
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
          {guardando ? "Guardando…" : "Guardar"}
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