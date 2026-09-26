import { useState } from "react";
import Login from "./pages/Login";
import Pacientes from "./pages/Pacientes";
import Expediente from "./pages/Expediente";
import { guardarToken } from "./api/client";
import type { Sesion } from "./api/tipos";

export default function App() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [expediente, setExpediente] = useState<number | null>(null);

  if (!sesion) return <Login alEntrar={setSesion} />;

  function salir() {
    guardarToken(null);
    setSesion(null);
    setExpediente(null);
  }

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

      <main className="mx-auto max-w-5xl px-6 py-8">
        {expediente === null ? (
          <Pacientes alAbrirExpediente={setExpediente} />
        ) : (
          <Expediente idPaciente={expediente} alVolver={() => setExpediente(null)} />
        )}
      </main>
    </div>
  );
}