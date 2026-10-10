import { useEffect, useState } from "react";
import { listarCategorias, listarProductos } from "../api/inventario";
import type { Categoria, Producto, Sesion } from "../api/tipos";
import FormularioProducto from "../components/FormularioProducto";

interface Props {
  sesion: Sesion;
}

export default function Inventario({ sesion }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [lista, setLista] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<number | undefined>();
  const [soloBajoMinimo, setSoloBajoMinimo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [creando, setCreando] = useState(false);

  // RF-18 a RF-20: solo el administrador modifica el catalogo
  const puedeEditar = sesion.rol === "ADMINISTRADOR";

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {});
  }, []);

  async function consultar() {
    setCargando(true);
    setError(null);
    try {
      setLista(await listarProductos(busqueda, filtroCategoria, soloBajoMinimo));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo consultar.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(consultar, 300);
    return () => clearTimeout(t);
  }, [busqueda, filtroCategoria, soloBajoMinimo]);

  const moneda = (v: number) =>
    `Q ${v.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

  function cerrarFormulario() {
    setCreando(false);
    setEditando(null);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">Inventario</h2>
      <p className="text-stone-500 text-sm mb-6">
        Catalogo de productos y control de existencias.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Nombre del producto"
          className="flex-1 min-w-48 rounded-md border border-stone-300 px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-teal-600"
        />

        <select
          value={filtroCategoria ?? ""}
          onChange={(e) => setFiltroCategoria(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="">Todas las categorias</option>
          {categorias.map((c) => (
            <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={soloBajoMinimo}
            onChange={(e) => setSoloBajoMinimo(e.target.checked)}
            className="rounded border-stone-300 text-teal-700 focus:ring-teal-600"
          />
          Bajo minimo
        </label>

        {puedeEditar && !creando && !editando && (
          <button
            onClick={() => setCreando(true)}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white
                       hover:bg-teal-800"
          >
            Nuevo producto
          </button>
        )}
      </div>

      {(creando || editando) && (
        <FormularioProducto
          categorias={categorias}
          producto={editando}
          alGuardar={() => {
            cerrarFormulario();
            consultar();
          }}
          alCancelar={cerrarFormulario}
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
            Ningun producto coincide con los filtros.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-2 font-semibold">Producto</th>
                <th className="px-4 py-2 font-semibold">Categoria</th>
                <th className="px-4 py-2 font-semibold text-right">Precio</th>
                <th className="px-4 py-2 font-semibold text-right">Existencia</th>
                <th className="px-4 py-2 font-semibold text-right">Minimo</th>
                {puedeEditar && <th></th>}
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.idProducto} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 text-slate-800">{p.nombre}</td>
                  <td className="px-4 py-3 text-stone-600">{p.categoria}</td>
                  <td className="px-4 py-3 text-right text-stone-700 tabular-nums">
                    {moneda(p.precio)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.bajoPedido ? (
                      <span className="text-stone-400">bajo pedido</span>
                    ) : (
                      <span className={p.requiereReorden
                        ? "font-semibold text-amber-700" : "text-stone-700"}>
                        {p.stockActual}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-500 tabular-nums">
                    {p.bajoPedido ? "—" : p.stockMinimo}
                  </td>
                  {puedeEditar && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setEditando(p); setCreando(false); }}
                        className="rounded-md border border-stone-300 px-3 py-1.5 text-slate-700
                                   hover:bg-stone-50"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}