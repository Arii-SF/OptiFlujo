import { useEffect, useState } from "react";
import { listarPacientes } from "../api/pacientes";
import { listarProductos } from "../api/inventario";
import { procesarVenta } from "../api/ventas";
import type { PacienteLista, Producto, LineaCarrito, Venta } from "../api/tipos";

export default function PuntoVenta() {
  const [pacientes, setPacientes] = useState<PacienteLista[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [paciente, setPaciente] = useState<number | "">("");
  const [carrito, setCarrito] = useState<LineaCarrito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [comprobante, setComprobante] = useState<Venta | null>(null);

  useEffect(() => {
    listarPacientes().then(setPacientes).catch(() => {});
    listarProductos().then(setProductos).catch(() => {});
  }, []);

  const moneda = (v: number) =>
    `Q ${v.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

  const total = carrito.reduce((s, l) => s + l.precio * l.cantidad, 0);

  function agregar(p: Producto) {
    setError(null);
    setCarrito((previo) => {
      const existente = previo.find((l) => l.idProducto === p.idProducto);
      if (existente) {
        return previo.map((l) =>
          l.idProducto === p.idProducto ? { ...l, cantidad: l.cantidad + 1 } : l
        );
      }
      return [...previo, {
        idProducto: p.idProducto,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: 1,
        stockActual: p.stockActual,
        bajoPedido: p.bajoPedido,
      }];
    });
  }

  function cambiarCantidad(id: number, cantidad: number) {
    if (cantidad < 1) return quitar(id);
    setCarrito((previo) =>
      previo.map((l) => (l.idProducto === id ? { ...l, cantidad } : l))
    );
  }

  const quitar = (id: number) =>
    setCarrito((previo) => previo.filter((l) => l.idProducto !== id));

  async function confirmar() {
    if (paciente === "") return setError("Seleccione un paciente.");
    if (carrito.length === 0) return setError("Agregue al menos un producto.");

    setError(null);
    setProcesando(true);

    try {
      const venta = await procesarVenta(
        Number(paciente),
        carrito.map((l) => ({ idProducto: l.idProducto, cantidad: l.cantidad }))
      );
      setComprobante(venta);
      setCarrito([]);
      setPaciente("");
      // La existencia cambio, de modo que se recupera el catalogo
      listarProductos().then(setProductos).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo procesar.");
    } finally {
      setProcesando(false);
    }
  }

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (comprobante) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-1">Transaccion registrada</h2>
        <p className="text-stone-500 text-sm mb-6">
          Comprobante numero {comprobante.idVenta}
        </p>

        <div className="rounded-lg border border-stone-200 bg-white p-5 mb-6 max-w-lg">
          <p className="text-sm text-stone-600 mb-4">{comprobante.paciente}</p>
          <table className="w-full text-sm mb-4">
            <tbody>
              {comprobante.lineas.map((l, i) => (
                <tr key={i} className="border-b border-stone-100 last:border-0">
                  <td className="py-2 text-slate-800">{l.producto}</td>
                  <td className="py-2 text-right text-stone-500 tabular-nums">
                    {l.cantidad} × {moneda(l.precioUnitario)}
                  </td>
                  <td className="py-2 text-right text-slate-800 tabular-nums">
                    {moneda(l.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{moneda(comprobante.total)}</span>
          </div>
        </div>

        <button
          onClick={() => setComprobante(null)}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-teal-800"
        >
          Nueva transaccion
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800">Punto de venta</h2>
      <p className="text-stone-500 text-sm mb-6">
        Seleccione el paciente y agregue los productos.
      </p>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="block text-xs text-stone-500 mb-1">Paciente</label>
          <select
            value={paciente}
            onChange={(e) => setPaciente(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm mb-4
                       focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="">Seleccione…</option>
            {pacientes.map((p) => (
              <option key={p.idPaciente} value={p.idPaciente}>{p.nombreCompleto}</option>
            ))}
          </select>

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto"
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm mb-3
                       focus:outline-none focus:ring-2 focus:ring-teal-600"
          />

          <div className="rounded-lg border border-stone-200 bg-white max-h-80 overflow-y-auto">
            {filtrados.map((p) => (
              <button
                key={p.idProducto}
                onClick={() => agregar(p)}
                className="flex w-full items-center justify-between border-b border-stone-100
                           px-4 py-2.5 text-left text-sm last:border-0 hover:bg-stone-50"
              >
                <span className="text-slate-800">{p.nombre}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-stone-400">
                    {p.bajoPedido ? "bajo pedido" : `${p.stockActual} disp.`}
                  </span>
                  <span className="tabular-nums text-stone-700">{moneda(p.precio)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-stone-500 mb-1">Detalle</p>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            {carrito.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500">
                No hay productos agregados.
              </p>
            ) : (
              <>
                <table className="w-full text-sm mb-4">
                  <tbody>
                    {carrito.map((l) => (
                      <tr key={l.idProducto} className="border-b border-stone-100 last:border-0">
                        <td className="py-2 text-slate-800">{l.nombre}</td>
                        <td className="py-2 text-right">
                          <input
                            type="number"
                            min="1"
                            value={l.cantidad}
                            onChange={(e) =>
                              cambiarCantidad(l.idProducto, Number(e.target.value))}
                            className="w-16 rounded border border-stone-300 px-2 py-1
                                       text-right text-sm tabular-nums"
                          />
                        </td>
                        <td className="py-2 text-right tabular-nums text-slate-800">
                          {moneda(l.precio * l.cantidad)}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <button
                            onClick={() => quitar(l.idProducto)}
                            className="text-stone-400 hover:text-red-700"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between border-t border-stone-200 pt-3 mb-4
                                text-base font-semibold text-slate-800">
                  <span>Total</span>
                  <span className="tabular-nums">{moneda(total)}</span>
                </div>

                <button
                  onClick={confirmar}
                  disabled={procesando}
                  className="w-full rounded-md bg-teal-700 py-2.5 text-sm font-semibold
                             text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  {procesando ? "Procesando…" : "Confirmar transaccion"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}