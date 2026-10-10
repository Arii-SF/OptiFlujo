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

export interface NuevoPaciente {
  nombreCompleto: string;
  dpi: string | null;
  fechaNacimiento: string | null;
  telefono: string | null;
  correo: string | null;
  distanciaInterpupilar: number | null;
  antecedentesOculares: string | null;
} 

export interface Alerta {
  idPaciente: number;
  nombreCompleto: string;
  telefono: string | null;
  idReceta: number;
  fechaEmision: string;
  fechaVencimiento: string;
  diasRestantes: number;
  estadoVigencia: Vigencia;
}

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Producto {
  idProducto: number;
  nombre: string;
  idCategoria: number;
  categoria: string;
  descripcion: string | null;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  bajoPedido: boolean;
  requiereReorden: boolean;
}

export interface GuardarProducto {
  nombre: string;
  idCategoria: number;
  descripcion: string | null;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  bajoPedido: boolean;
}