import { pedir } from "./client";
import type { Alerta } from "./tipos";

export function listarAlertas(estado?: string) {
  const ruta = estado ? `/api/alertas?estado=${estado}` : "/api/alertas";
  return pedir<Alerta[]>(ruta);
}