import { useState } from "react";
import { pedir, guardarToken } from "../api/client";
import type { Sesion } from "../api/tipos";

interface Props {
  alEntrar: (sesion: Sesion) => void;
}

export default function Login({ alEntrar }: Props) {
  const [correo, setCorreo] = useState("admin@optiflujo.local");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const sesion = await pedir<Sesion>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ correo, contrasenia }),
      });

      guardarToken(sesion.token);
      alEntrar(sesion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo entrar.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-stone-50 px-6">
      <form onSubmit={entrar} className="w-full max-w-sm">
        {/* La marca escalona su tamano a la manera de una cartilla optometrica */}
        <div className="text-center mb-10 leading-none">
          <div className="text-6xl font-bold tracking-tight text-slate-800">OptiFlujo</div>
          <div className="text-3xl font-bold text-teal-700 mt-1">Gestion optica</div>
          <div className="text-sm text-stone-500 mt-4">
            Pacientes, prescripciones y punto de venta
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block text-sm text-stone-600 mb-1">Correo</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full rounded-md border border-stone-300 px-3 py-2 mb-4
                     focus:outline-none focus:ring-2 focus:ring-teal-600"
        />

        <label className="block text-sm text-stone-600 mb-1">Contrasenia</label>
        <input
          type="password"
          value={contrasenia}
          onChange={(e) => setContrasenia(e.target.value)}
          className="w-full rounded-md border border-stone-300 px-3 py-2 mb-6
                     focus:outline-none focus:ring-2 focus:ring-teal-600"
        />

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-md bg-teal-700 py-2.5 font-semibold text-white
                     hover:bg-teal-800 disabled:opacity-50"
        >
          {cargando ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}