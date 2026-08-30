"use client";

import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { useObterEventoQuery } from "@/config/redux/api/eventosApi";
import { EventoDetalhes } from "@/types/evento.types";
import { useCalendario } from "./hooks/use-calendario";
import { useCalendarioStyles } from "./styles";
import { CalendarioHeader } from "./components/CalendarioHeader";
import { CalendarioGrid } from "./components/CalendarioGrid";
import { OcorrenciaDrawer } from "./components/OcorrenciaDrawer";
import { OcorrenciaVisualizacaoDrawer } from "./components/OcorrenciaVisualizacaoDrawer";
import { EventoVisualizacaoDrawer } from "./components/EventoVisualizacaoDrawer";

export default function CalendarioModule() {
  const {
    view,
    date,
    itens,
    areas,
    ocorrencias,
    podeGerenciar,
    isLoading,
    dialogState,
    eventoDrawer,
    ocorrenciaVisualizacao,
    control,
    isSubmitting,
    erro,
    onViewChange,
    onNavigate,
    onSelectSlot,
    onSelectEvent,
    onNovaOcorrencia,
    onCloseDialog,
    onCloseEventoDrawer,
    onCloseOcorrenciaVisualizacao,
    onEditarOcorrencia,
    podeEditarOcorrencia,
    onSubmitForm,
    onDeleteOcorrencia,
  } = useCalendario();
  const styles = useCalendarioStyles();

  const {
    data: eventoSelecionado,
    isLoading: carregandoEvento,
    isFetching: atualizandoEvento,
    refetch: refetchEvento,
  } = useObterEventoQuery(eventoDrawer.eventoId ?? "", {
    skip: !eventoDrawer.eventoId,
  });

  useEffect(() => {
    if (eventoDrawer.eventoId) refetchEvento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoDrawer.clickId]);

  const ocorrenciaSelecionada = ocorrencias.find((o) => o.id === ocorrenciaVisualizacao.ocorrenciaId) ?? null;

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

        <OcorrenciaDrawer
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

        <OcorrenciaVisualizacaoDrawer
          open={ocorrenciaVisualizacao.open}
          ocorrencia={ocorrenciaSelecionada}
          podeEditar={ocorrenciaSelecionada ? podeEditarOcorrencia(ocorrenciaSelecionada) : false}
          onClose={onCloseOcorrenciaVisualizacao}
          onEditar={onEditarOcorrencia}
        />

        <EventoVisualizacaoDrawer
          open={eventoDrawer.open}
          isLoading={carregandoEvento}
          isFetching={atualizandoEvento}
          onClose={onCloseEventoDrawer}
          evento={(eventoSelecionado as EventoDetalhes) ?? null}
        />
      </Box>
    </LocalizationProvider>
  );
}
