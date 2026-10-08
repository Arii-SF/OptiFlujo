import { useState } from "react";
import Login from "./pages/Login";
import Pacientes from "./pages/Pacientes";
import Expediente from "./pages/Expediente";
import Alertas from "./pages/Alertas";
import { guardarToken } from "./api/client";
import type { Sesion } from "./api/tipos";

type Seccion = "pacientes" | "alertas";

export default function App() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [seccion, setSeccion] = useState<Seccion>("pacientes");
  const [expediente, setExpediente] = useState<number | null>(null);

  if (!sesion) return <Login alEntrar={setSesion} />;

  function salir() {
    guardarToken(null);
    setSesion(null);
    setExpediente(null);
    setSeccion("pacientes");
  }

  function ir(destino: Seccion) {
    setSeccion(destino);
    setExpediente(null);
  }

  const pestania = (destino: Seccion, etiqueta: string) => (
    <button
      onClick={() => ir(destino)}
      className={`border-b-2 px-4 py-3 text-sm ${
        seccion === destino
          ? "border-teal-700 font-semibold text-teal-700"
          : "border-transparent text-stone-500 hover:text-slate-800"
      }`}
    >
      {etiqueta}
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="flex h-14 items-center justify-between bg-slate-800 px-6 text-white">
        <span className="text-lg font-bold">OptiFlujo</span>
        <div className="flex items-center gap-3 text-sm">
          <span>{sesion.nombre}</span>
          <span className="rounded bg-white/15 px-2 py-0.5 text-xs">{sesion.rol}</span>
          <button
            onClick={salir}
            className="rounded border border-white/30 px-3 py-1 hover:bg-white/10"
          >
            Salir
          </button>
        </div>
      </header>

      <nav className="flex gap-1 border-b border-stone-200 bg-white px-6">
        {pestania("pacientes", "Pacientes")}
        {pestania("alertas", "Alertas")}
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {seccion === "alertas" ? (
          <Alertas />
        ) : expediente === null ? (
          <Pacientes alAbrirExpediente={setExpediente} />
        ) : (
          <Expediente idPaciente={expediente} alVolver={() => setExpediente(null)} />
        )}
      </main>
    </div>
  );
}