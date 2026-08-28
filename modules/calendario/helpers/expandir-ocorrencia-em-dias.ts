import { eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { OcorrenciaCalendario } from "@/types/ocorrencia-calendario.types";

export interface DiaOcorrencia {
  data: Date;
  horaInicio: string;
  horaFim: string;
}

export function expandirOcorrenciaEmDias(ocorrencia: OcorrenciaCalendario): DiaOcorrencia[] {
  const dias = eachDayOfInterval({
    start: parseISO(ocorrencia.dataInicio),
    end: parseISO(ocorrencia.dataFim),
  });

  return dias.map((dia) => {
    const excecao = ocorrencia.excecoes.find((e) => isSameDay(parseISO(e.data), dia));
    return {
      data: dia,
      horaInicio: excecao?.horaInicio ?? ocorrencia.horaInicioDefault,
      horaFim: excecao?.horaFim ?? ocorrencia.horaFimDefault,
    };
  });
}
