import { addMonths, isWithinInterval, parseISO, subMonths } from "date-fns";
import { Feriado } from "@/config/redux/api/feriadosApi";

export interface JanelaFeriados {
  inicio: Date;
  fim: Date;
  anoInicio: number;
  anoFim: number;
}

export function obterJanelaFeriados(referencia: Date = new Date()): JanelaFeriados {
  const inicio = subMonths(referencia, 6);
  const fim = addMonths(referencia, 6);
  return { inicio, fim, anoInicio: inicio.getFullYear(), anoFim: fim.getFullYear() };
}

export function filtrarFeriadosNaJanela(feriados: Feriado[], janela: JanelaFeriados): Feriado[] {
  return feriados.filter((feriado) =>
    isWithinInterval(parseISO(feriado.date), { start: janela.inicio, end: janela.fim })
  );
}
