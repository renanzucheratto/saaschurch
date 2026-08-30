"use client";

import { Calendar, dateFnsLocalizer, View, SlotInfo } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Box } from "@mui/material";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCalendarioStyles } from "../styles";
import { ItemCalendario } from "../helpers/calendario-item.types";
import { EventoBloco } from "./EventoBloco";
import { OcorrenciaBloco } from "./OcorrenciaBloco";
import { FeriadoBloco } from "./FeriadoBloco";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales: { "pt-BR": ptBR },
});

interface Props {
  itens: ItemCalendario[];
  view: View;
  date: Date;
  onViewChange: (view: View) => void;
  onNavigate: (date: Date) => void;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: (item: ItemCalendario) => void;
}

export function CalendarioGrid({ itens, view, date, onViewChange, onNavigate, onSelectSlot, onSelectEvent }: Props) {
  const styles = useCalendarioStyles();

  return (
    <Box sx={styles.gridWrapper}>
      <Calendar
        culture="pt-BR"
        localizer={localizer}
        events={itens}
        view={view}
        date={date}
        views={["month", "week"]}
        onView={onViewChange}
        onNavigate={onNavigate}
        selectable
        popup
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        eventPropGetter={() => ({
          style: { backgroundColor: "transparent", border: "none", padding: 0 },
        })}
        components={{
          event: ({ event }: { event: ItemCalendario }) => {
            if (event.tipo === "feriado") return <FeriadoBloco item={event} />;
            if (event.tipo === "evento") return <EventoBloco item={event} />;
            return <OcorrenciaBloco item={event} />;
          },
        }}
        messages={{
          month: "Mês",
          week: "Semana",
          today: "Hoje",
          previous: "Anterior",
          next: "Próximo",
          noEventsInRange: "Nenhuma ocorrência neste período.",
          showMore: (total) => `+${total} mais`,
        }}
      />
    </Box>
  );
}
