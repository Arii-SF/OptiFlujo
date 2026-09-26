import { pedir } from "./client";
import type { PacienteLista, Expediente } from "./tipos";

export function listarPacientes(busqueda?: string) {
  const ruta = busqueda?.trim()
    ? `/api/pacientes?busqueda=${encodeURIComponent(busqueda.trim())}`
    : "/api/pacientes";
  return pedir<PacienteLista[]>(ruta);
}

export function obtenerExpediente(id: number) {
  return pedir<Expediente>(`/api/pacientes/${id}`);
}

import type { NuevaReceta, Receta } from "./tipos";

export function crearReceta(datos: NuevaReceta) {
  return pedir<Receta>("/api/recetas", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}