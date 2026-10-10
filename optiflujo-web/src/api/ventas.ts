import { pedir } from "./client";
import type { Venta } from "./tipos";

export function procesarVenta(
  idPaciente: number,
  lineas: { idProducto: number; cantidad: number; idReceta?: number }[]
) {
  return pedir<Venta>("/api/ventas", {
    method: "POST",
    body: JSON.stringify({ idPaciente, lineas }),
  });
}