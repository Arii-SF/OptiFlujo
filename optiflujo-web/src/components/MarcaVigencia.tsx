import type { Vigencia } from "../api/tipos";

const ESTILOS: Record<Vigencia, string> = {
  VIGENTE: "bg-teal-50 text-teal-700",
  PROXIMA_A_VENCER: "bg-amber-50 text-amber-700",
  VENCIDA: "bg-red-50 text-red-700",
  SIN_RECETA: "bg-stone-100 text-stone-500",
};

const TEXTOS: Record<Vigencia, string> = {
  VIGENTE: "vigente",
  PROXIMA_A_VENCER: "proxima a vencer",
  VENCIDA: "vencida",
  SIN_RECETA: "sin receta",
};

export default function MarcaVigencia({ estado }: { estado: Vigencia }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTILOS[estado]}`}>
      {TEXTOS[estado]}
    </span>
  );
}