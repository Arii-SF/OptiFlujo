const BASE = import.meta.env.VITE_API_URL ?? "";
let token: string | null = null;

export function guardarToken(valor: string | null) {
  token = valor;
  if (valor) sessionStorage.setItem("optiflujo_token", valor);
  else sessionStorage.removeItem("optiflujo_token");
}

export function recuperarToken(): string | null {
  if (!token) token = sessionStorage.getItem("optiflujo_token");
  return token;
}

export async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const cabeceras: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opciones.headers as Record<string, string>) ?? {}),
  };

  const actual = recuperarToken();
  if (actual) cabeceras.Authorization = `Bearer ${actual}`;

  const respuesta = await fetch(BASE + ruta, { ...opciones, headers: cabeceras });

  if (respuesta.status === 401) throw new Error("La sesión no es válida.");
  if (respuesta.status === 403) throw new Error("Su rol no tiene acceso.");

  const cuerpo = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // Las validaciones del modelo llegan agrupadas por campo
    const detalle = cuerpo?.errors
      ? Object.values(cuerpo.errors).flat().join(" ")
      : cuerpo?.mensaje;
    throw new Error(detalle ?? `Error ${respuesta.status}`);
  }

  return cuerpo as T;
}