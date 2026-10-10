import { pedir } from "./client";
import type { Usuario, CrearUsuario } from "./tipos";

export function listarUsuarios() {
  return pedir<Usuario[]>("/api/usuarios");
}

export function crearUsuario(datos: CrearUsuario) {
  return pedir<Usuario>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function cambiarEstadoUsuario(id: number, activo: boolean) {
  return pedir<null>(`/api/usuarios/${id}/estado?activo=${activo}`, {
    method: "PATCH",
  });
}