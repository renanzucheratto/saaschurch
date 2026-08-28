import { setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns";
import { OcorrenciaCalendario } from "@/types/ocorrencia-calendario.types";
import { expandirOcorrenciaEmDias } from "./expandir-ocorrencia-em-dias";
import { resolverCorOcorrencia } from "./resolver-cor-ocorrencia";
import { ItemCalendario } from "./calendario-item.types";

function combinarDataHora(data: Date, hora: string): Date {
  const [horas, minutos] = hora.split(":").map(Number);
  return setMilliseconds(setSeconds(setMinutes(setHours(data, horas), minutos), 0), 0);
}

export function mapearOcorrenciasParaCalendario(ocorrencias: OcorrenciaCalendario[]): ItemCalendario[] {
  return ocorrencias.flatMap((ocorrencia) => {
    const { corPrincipal, corsExtras } = resolverCorOcorrencia(ocorrencia.areas);
    const dias = expandirOcorrenciaEmDias(ocorrencia);

    return dias.map((dia) => ({
      id: `ocorrencia-${ocorrencia.id}-${dia.data.toISOString()}`,
      tipo: "ocorrencia" as const,
      title: ocorrencia.titulo,
      start: combinarDataHora(dia.data, dia.horaInicio),
      end: combinarDataHora(dia.data, dia.horaFim),
      resource: {
        corPrincipal,
        corsExtras,
        nota: ocorrencia.nota,
        ocorrenciaId: ocorrencia.id,
      },
    }));
  });
}
