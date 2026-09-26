export interface Sesion {
  token: string;
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: "ADMINISTRADOR" | "OPTOMETRISTA" | "VENDEDOR";
  expira: string;
}

export type Vigencia = "VIGENTE" | "PROXIMA_A_VENCER" | "VENCIDA" | "SIN_RECETA";

export interface PacienteLista {
  idPaciente: number;
  nombreCompleto: string;
  dpi: string | null;
  telefono: string | null;
  ultimaReceta: string | null;
  estadoVigencia: Vigencia;
}

export interface Receta {
  idReceta: number;
  odEsfera: number | null;
  odCilindro: number | null;
  odEje: number | null;
  odAdicion: number | null;
  oiEsfera: number | null;
  oiCilindro: number | null;
  oiEje: number | null;
  oiAdicion: number | null;
  fechaEmision: string;
  fechaVencimiento: string;
  diasParaVencer: number;
  estadoVigencia: Vigencia;
  observaciones: string | null;
  registradaPor: string;
}

export interface Expediente {
  idPaciente: number;
  nombreCompleto: string;
  dpi: string | null;
  fechaNacimiento: string | null;
  edad: number | null;
  telefono: string | null;
  correo: string | null;
  distanciaInterpupilar: number | null;
  antecedentesOculares: string | null;
  historial: Receta[];
}

export interface NuevaReceta {
  idPaciente: number;
  odEsfera: number | null;
  odCilindro: number | null;
  odEje: number | null;
  odAdicion: number | null;
  oiEsfera: number | null;
  oiCilindro: number | null;
  oiEje: number | null;
  oiAdicion: number | null;
  observaciones: string | null;
}