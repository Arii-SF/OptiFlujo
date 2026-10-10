import { pedir } from "./client";
import type { Cita, GuardarCita } from "./tipos";

// Las fechas viajan en hora local, sin convertir a UTC: la agenda del
// establecimiento se lleva en su propio horario.
const local = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-` +
  `${String(d.getDate()).padStart(2, "0")}T00:00:00`;

export function listarCitas(desde: Date, hasta: Date) {
  const p = new URLSearchParams({ desde: local(desde), hasta: local(hasta) });
  return pedir<Cita[]>(`/api/citas?${p}`);
}

export function agendarCita(datos: GuardarCita) {
  return pedir<Cita>("/api/citas", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function reprogramarCita(id: number, datos: GuardarCita) {
  return pedir<Cita>(`/api/citas/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function cambiarEstadoCita(id: number, estado: string) {
  return pedir<null>(`/api/citas/${id}/estado?estado=${estado}`, {
    method: "PATCH",
  });
}