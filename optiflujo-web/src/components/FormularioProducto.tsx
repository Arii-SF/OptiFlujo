import { useState } from "react";
import { crearProducto, actualizarProducto } from "../api/inventario";
import type { Categoria, Producto, GuardarProducto } from "../api/tipos";

interface Props {
  categorias: Categoria[];
  producto: Producto | null;
  alGuardar: () => void;
  alCancelar: () => void;
}

export default function FormularioProducto({
  categorias, producto, alGuardar, alCancelar,
}: Props) {
  const [campos, setCampos] = useState({
    nombre: producto?.nombre ?? "",
    idCategoria: String(producto?.idCategoria ?? categorias[0]?.idCategoria ?? ""),
    descripcion: producto?.descripcion ?? "",
    precio: producto ? String(producto.precio) : "",
    stockActual: producto ? String(producto.stockActual) : "0",
    stockMinimo: producto ? String(producto.stockMinimo) : "0",
    bajoPedido: producto?.bajoPedido ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cambiar = (nombre: string, valor: string | boolean) =>
    setCampos((previo) => ({ ...previo, [nombre]: valor }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const datos: GuardarProducto = {
      nombre: campos.nombre.trim(),
      idCategoria: Number(campos.idCategoria),
      descripcion: campos.descripcion.trim() || null,
      precio: Number(campos.precio),
      stockActual: Number(campos.stockActual),
      stockMinimo: Number(campos.stockMinimo),
      bajoPedido: campos.bajoPedido,
    };

    try {
      if (producto) await actualizarProducto(producto.idProducto, datos);
      else await crearProducto(datos);
      alGuardar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="rounded-lg border border-stone-200 bg-white p-5 mb-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        {producto ? "Editar producto" : "Nuevo producto"}
      </h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
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
          <label className="block text-xs text-stone-500 mb-1">Categoria</label>
          <select
            value={campos.idCategoria}
            onChange={(e) => cambiar("idCategoria", e.target.value)}
            className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {categorias.map((c) => (
              <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-stone-500 mb-1">Precio (Q)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={campos.precio}
            onChange={(e) => cambiar("precio", e.target.value)}
            className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm tabular-nums
                       focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* RN-07: los productos elaborados bajo pedido no manejan existencia */}
      <label className="flex items-center gap-2 text-sm text-slate-700 mb-3">
        <input
          type="checkbox"
          checked={campos.bajoPedido}
          onChange={(e) => cambiar("bajoPedido", e.target.checked)}
          className="rounded border-stone-300 text-teal-700 focus:ring-teal-600"
        />
        Se elabora bajo pedido (no maneja existencia)
      </label>

      {!campos.bajoPedido && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Existencia actual</label>
            <input
              type="number"
              min="0"
              value={campos.stockActual}
              onChange={(e) => cambiar("stockActual", e.target.value)}
              className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm tabular-nums
                         focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Existencia minima</label>
            <input
              type="number"
              min="0"
              value={campos.stockMinimo}
              onChange={(e) => cambiar("stockMinimo", e.target.value)}
              className="w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm tabular-nums
                         focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>
      )}

      <label className="block text-xs text-stone-500 mb-1">Descripcion</label>
      <textarea
        value={campos.descripcion}
        onChange={(e) => cambiar("descripcion", e.target.value)}
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