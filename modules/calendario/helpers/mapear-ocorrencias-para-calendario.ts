import { parseISO } from "date-fns";
import { OcorrenciaCalendario } from "@/types/ocorrencia-calendario.types";
import { resolverCorOcorrencia } from "./resolver-cor-ocorrencia";
import { ItemCalendario } from "./calendario-item.types";

export function mapearOcorrenciasParaCalendario(ocorrencias: OcorrenciaCalendario[]): ItemCalendario[] {
  return ocorrencias.map((ocorrencia) => {
    const { corPrincipal, corsExtras } = resolverCorOcorrencia(ocorrencia.areas);

    return {
      id: `ocorrencia-${ocorrencia.id}`,
      tipo: "ocorrencia" as const,
      title: ocorrencia.titulo,
      start: parseISO(ocorrencia.dataInicio),
      end: parseISO(ocorrencia.dataFim),
      resource: {
        corPrincipal,
        corsExtras,
        nota: ocorrencia.nota,
        ocorrenciaId: ocorrencia.id,
        excecoes: ocorrencia.excecoes,
      },
    };
  });
}
