"use client";

import { Box, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { useCalendario } from "./hooks/use-calendario";
import { useCalendarioStyles } from "./styles";
import { CalendarioHeader } from "./components/CalendarioHeader";
import { CalendarioGrid } from "./components/CalendarioGrid";
import { OcorrenciaDialog } from "./components/OcorrenciaDialog";

export default function CalendarioModule() {
  const {
    view,
    date,
    itens,
    areas,
    podeGerenciar,
    isLoading,
    dialogState,
    control,
    isSubmitting,
    erro,
    onViewChange,
    onNavigate,
    onSelectSlot,
    onSelectEvent,
    onNovaOcorrencia,
    onCloseDialog,
    onSubmitForm,
    onDeleteOcorrencia,
  } = useCalendario();
  const styles = useCalendarioStyles();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={styles.container}>
        <CalendarioHeader
          view={view}
          date={date}
          podeGerenciar={podeGerenciar}
          onViewChange={onViewChange}
          onNavigate={onNavigate}
          onNovaOcorrencia={onNovaOcorrencia}
        />

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CalendarioGrid
            itens={itens}
            view={view}
            date={date}
            onViewChange={onViewChange}
            onNavigate={onNavigate}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
          />
        )}

        <OcorrenciaDialog
          open={dialogState.open}
          mode={dialogState.mode}
          control={control}
          areas={areas}
          isSubmitting={isSubmitting}
          erro={erro}
          onClose={onCloseDialog}
          onSubmit={onSubmitForm}
          onDelete={dialogState.mode === "edit" ? onDeleteOcorrencia : undefined}
        />
      </Box>
    </LocalizationProvider>
  );
}
