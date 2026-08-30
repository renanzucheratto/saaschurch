import { parseISO } from "date-fns";
import { Feriado } from "@/config/redux/api/feriadosApi";
import { COR_FERIADO } from "./constants";
import { ItemCalendario } from "./calendario-item.types";

export function mapearFeriadosParaCalendario(feriados: Feriado[]): ItemCalendario[] {
  return feriados.map((feriado) => {
    const data = parseISO(feriado.date);
    return {
      id: `feriado-${feriado.date}`,
      tipo: "feriado" as const,
      title: feriado.name,
      start: data,
      end: data,
      allDay: true,
      resource: {
        corPrincipal: COR_FERIADO,
        corsExtras: [],
      },
    };
  });
}
