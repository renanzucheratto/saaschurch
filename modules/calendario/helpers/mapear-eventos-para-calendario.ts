import { parseISO } from "date-fns";
import { EventoListagem } from "@/types/evento.types";
import { COR_NEUTRA_EVENTO } from "./constants";
import { ItemCalendario } from "./calendario-item.types";

export function mapearEventosParaCalendario(eventos: EventoListagem[]): ItemCalendario[] {
  return eventos
    .filter((evento) => evento.data_inicio && evento.data_fim)
    .map((evento) => ({
      id: `evento-${evento.id}`,
      tipo: "evento" as const,
      title: evento.nome,
      start: parseISO(evento.data_inicio as string),
      end: parseISO(evento.data_fim as string),
      resource: {
        corPrincipal: COR_NEUTRA_EVENTO,
        corsExtras: [],
        eventoId: evento.id,
      },
    }));
}
