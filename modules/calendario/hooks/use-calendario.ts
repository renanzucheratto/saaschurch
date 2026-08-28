"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { View, SlotInfo } from "react-big-calendar";
import { addHours, format, parseISO, setHours, setMinutes } from "date-fns";
import { useListarEventosQuery } from "@/config/redux/api/eventosApi";
import { useListarAreasQuery } from "@/config/redux/api/areasApi";
import {
  useListarOcorrenciasQuery,
  useCriarOcorrenciaMutation,
  useAtualizarOcorrenciaMutation,
  useRemoverOcorrenciaMutation,
  CriarOcorrenciaRequest,
} from "@/config/redux/api/ocorrenciasCalendarioApi";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { mapearEventosParaCalendario } from "../helpers/mapear-eventos-para-calendario";
import { mapearOcorrenciasParaCalendario } from "../helpers/mapear-ocorrencias-para-calendario";
import { ocorrenciaSchema, OcorrenciaFormData } from "../helpers/validation";
import { CalendarioView } from "../helpers/constants";
import { ItemCalendario } from "../helpers/calendario-item.types";

interface DialogState {
  open: boolean;
  mode: "create" | "edit";
  ocorrenciaId?: string;
}

function getErrorMessage(value: unknown): string {
  if (typeof value === "object" && value !== null && "data" in value) {
    const data = (value as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "error" in data) {
      const errorValue = (data as { error?: unknown }).error;
      if (typeof errorValue === "string") return errorValue;
    }
  }
  return "Erro ao salvar ocorrência";
}

export function useCalendario() {
  const { is } = usePermissions();
  const podeGerenciar = is("lider", "backoffice");

  const [view, setView] = useState<CalendarioView>("month");
  const [date, setDate] = useState(new Date());
  const [dialogState, setDialogState] = useState<DialogState>({ open: false, mode: "create" });
  const [erro, setErro] = useState<string | null>(null);

  const { data: eventos = [], isLoading: carregandoEventos } = useListarEventosQuery();
  const { data: ocorrencias = [], isLoading: carregandoOcorrencias } = useListarOcorrenciasQuery();
  const { data: areas = [] } = useListarAreasQuery();

  const [criarOcorrencia, { isLoading: criando }] = useCriarOcorrenciaMutation();
  const [atualizarOcorrencia, { isLoading: atualizando }] = useAtualizarOcorrenciaMutation();
  const [removerOcorrencia] = useRemoverOcorrenciaMutation();

  const itens = useMemo<ItemCalendario[]>(
    () => [...mapearEventosParaCalendario(eventos), ...mapearOcorrenciasParaCalendario(ocorrencias)],
    [eventos, ocorrencias]
  );

  const { control, handleSubmit, reset } = useForm<OcorrenciaFormData>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: { titulo: "", de: new Date(), ate: addHours(new Date(), 1), nota: "", areaIds: [], excecoes: [] },
  });

  function abrirCriacao(inicio: Date) {
    const de = inicio.getHours() === 0 && inicio.getMinutes() === 0 ? setMinutes(setHours(inicio, 9), 0) : inicio;
    reset({ titulo: "", de, ate: addHours(de, 1), nota: "", areaIds: [], excecoes: [] });
    setErro(null);
    setDialogState({ open: true, mode: "create" });
  }

  function abrirEdicao(ocorrenciaId: string) {
    const ocorrencia = ocorrencias.find((o) => o.id === ocorrenciaId);
    if (!ocorrencia) return;

    reset({
      titulo: ocorrencia.titulo,
      de: parseISO(ocorrencia.dataInicio),
      ate: parseISO(ocorrencia.dataFim),
      nota: ocorrencia.nota ?? "",
      areaIds: ocorrencia.areas.map((a) => a.id),
      excecoes: ocorrencia.excecoes.map((e) => ({
        data: parseISO(e.data),
        horaInicio: e.horaInicio,
        horaFim: e.horaFim,
      })),
    });
    setErro(null);
    setDialogState({ open: true, mode: "edit", ocorrenciaId });
  }

  function onSelectSlot(slotInfo: SlotInfo) {
    if (!podeGerenciar) return;
    abrirCriacao(slotInfo.start);
  }

  function onSelectEvent(item: ItemCalendario) {
    if (item.tipo === "evento") return;
    if (!podeGerenciar || !item.resource.ocorrenciaId) return;
    abrirEdicao(item.resource.ocorrenciaId);
  }

  function onNovaOcorrencia() {
    abrirCriacao(new Date());
  }

  function onCloseDialog() {
    setDialogState({ open: false, mode: "create" });
    setErro(null);
  }

  const onSubmitForm = handleSubmit(async (data) => {
    const payload: CriarOcorrenciaRequest = {
      titulo: data.titulo,
      nota: data.nota || null,
      dataInicio: data.de.toISOString(),
      dataFim: data.ate.toISOString(),
      horaInicioDefault: format(data.de, "HH:mm"),
      horaFimDefault: format(data.ate, "HH:mm"),
      areaIds: data.areaIds,
      excecoes: data.excecoes.map((e) => ({
        data: e.data.toISOString(),
        horaInicio: e.horaInicio,
        horaFim: e.horaFim,
      })),
    };

    try {
      if (dialogState.mode === "create") {
        await criarOcorrencia(payload).unwrap();
      } else if (dialogState.ocorrenciaId) {
        await atualizarOcorrencia({ id: dialogState.ocorrenciaId, ...payload }).unwrap();
      }
      onCloseDialog();
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  });

  async function onDeleteOcorrencia() {
    if (!dialogState.ocorrenciaId) return;
    if (!confirm("Remover esta ocorrência? Esta ação não pode ser desfeita.")) return;
    try {
      await removerOcorrencia(dialogState.ocorrenciaId).unwrap();
      onCloseDialog();
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  return {
    view,
    date,
    itens,
    areas,
    podeGerenciar,
    isLoading: carregandoEventos || carregandoOcorrencias,
    dialogState,
    control,
    isSubmitting: criando || atualizando,
    erro,
    onViewChange: (novaView: View) => setView(novaView as CalendarioView),
    onNavigate: setDate,
    onSelectSlot,
    onSelectEvent,
    onNovaOcorrencia,
    onCloseDialog,
    onSubmitForm,
    onDeleteOcorrencia,
  };
}
