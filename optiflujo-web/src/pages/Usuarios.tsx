import { useEffect, useState } from "react";
import { listarUsuarios, crearUsuario, cambiarEstadoUsuario } from "../api/usuarios";
import type { Usuario, CrearUsuario } from "../api/tipos";

const ROLES = [
  { valor: "VENDEDOR", etiqueta: "Vendedor" },
  { valor: "OPTOMETRISTA", etiqueta: "Optometrista" },
  { valor: "ADMINISTRADOR", etiqueta: "Administrador" },
];

const VACIO = { nombre: "", correo: "", contrasenia: "", rol: "VENDEDOR" };

interface Props {
  idUsuarioActual: number;
}

export default function Usuarios({ idUsuarioActual }: Props) {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [campos, setCampos] = useState(VACIO);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function consultar() {
    setCargando(true);
    try {
      setLista(await listarUsuarios());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo consultar.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { consultar(); }, []);

  const cambiar = (nombre: string, valor: string) =>
    setCampos((previo) => ({ ...previo, [nombre]: valor }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setGuardando(true);

    try {
      await crearUsuario(campos as CrearUsuario);
      setCampos(VACIO);
      setCreando(false);
      setAviso("Usuario creado.");
      consultar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el usuario.");
    } finally {
      setGuardando(false);
    }
  }

  async function alternar(u: Usuario) {
    setError(null);
    try {
      await cambiarEstadoUsuario(u.idUsuario, !u.activo);
      consultar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar.");
    }
  }

  const etiquetaRol = (rol: string) =>
    ROLES.find((r) => r.valor === rol)?.etiqueta ?? rol;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">Usuarios</h2>
      <p className="text-stone-500 text-sm mb-6">
        Personal con acceso al sistema y su perfil de permisos.
      </p>

      {!creando && (
        <button
          onClick={() => { setCreando(true); setAviso(null); }}
          className="mb-6 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-teal-800"
        >
          Nuevo usuario
        </button>
      )}

      {creando && (
        <form onSubmit={enviar} className="rounded-lg border border-stone-200 bg-white p-5 mb-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Nuevo usuario</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={campos.nombre}
                onChange={(e) => cambiar("nombre", e.target.value)}
                className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Correo</label>
              <input
                type="email"
                required
                value={campos.correo}
                onChange={(e) => cambiar("correo", e.target.value)}
                className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Contraseña</label>
              <input
                type="password"
                required
                minLength={8}
                value={campos.contrasenia}
                onChange={(e) => cambiar("contrasenia", e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Perfil</label>
              <select
                value={campos.rol}
                onChange={(e) => cambiar("rol", e.target.value)}
                className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {ROLES.map((r) => (
                  <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white
                         hover:bg-teal-800 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Crear usuario"}
            </button>
            <button
              type="button"
              onClick={() => { setCreando(false); setCampos(VACIO); setError(null); }}
              className="rounded-md border border-stone-300 px-4 py-2 text-sm text-slate-700
                         hover:bg-stone-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">{error}</div>
      )}
      {aviso && (
        <div className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700 mb-4">{aviso}</div>
      )}

      <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
        {cargando ? (
          <p className="p-8 text-center text-stone-500 text-sm">Consultando…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-2 font-semibold">Nombre</th>
                <th className="px-4 py-2 font-semibold">Correo</th>
                <th className="px-4 py-2 font-semibold">Perfil</th>
                <th className="px-4 py-2 font-semibold">Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.idUsuario} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{u.nombre}</td>
                  <td className="px-4 py-3 text-stone-600">{u.correo}</td>
                  <td className="px-4 py-3 text-stone-600">{etiquetaRol(u.rol)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${u.activo ? "bg-teal-50 text-teal-700" : "bg-stone-100 text-stone-500"}`}>
                      {u.activo ? "activo" : "inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {/* Nadie puede desactivar su propia cuenta y quedarse fuera */}
                    {u.idUsuario !== idUsuarioActual && (
                      <button
                        onClick={() => alternar(u)}
                        className="rounded-md border border-stone-300 px-3 py-1.5 text-slate-700
                                   hover:bg-stone-50"
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    )}
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