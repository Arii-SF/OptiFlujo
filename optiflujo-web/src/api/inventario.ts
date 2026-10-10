import { pedir } from "./client";
import type { Categoria, Producto, GuardarProducto } from "./tipos";

export function listarCategorias() {
  return pedir<Categoria[]>("/api/inventario/categorias");
}

export function listarProductos(
  busqueda?: string,
  idCategoria?: number,
  bajoMinimo?: boolean
) {
  const p = new URLSearchParams();
  if (busqueda?.trim()) p.set("busqueda", busqueda.trim());
  if (idCategoria) p.set("idCategoria", String(idCategoria));
  if (bajoMinimo) p.set("bajoMinimo", "true");

  const consulta = p.toString();
  return pedir<Producto[]>(`/api/inventario/productos${consulta ? "?" + consulta : ""}`);
}

export function crearProducto(datos: GuardarProducto) {
  return pedir<Producto>("/api/inventario/productos", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarProducto(id: number, datos: GuardarProducto) {
  return pedir<Producto>(`/api/inventario/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}