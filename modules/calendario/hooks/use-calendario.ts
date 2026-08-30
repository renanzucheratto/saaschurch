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
import { useListarFeriadosQuery } from "@/config/redux/api/feriadosApi";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useAppSelector } from "@/config/redux/store";
import { selectCurrentUser } from "@/config/redux/slices/authSlice";
import { OcorrenciaCalendario } from "@/types/ocorrencia-calendario.types";
import { mapearEventosParaCalendario } from "../helpers/mapear-eventos-para-calendario";
import { mapearOcorrenciasParaCalendario } from "../helpers/mapear-ocorrencias-para-calendario";
import { mapearFeriadosParaCalendario } from "../helpers/mapear-feriados-para-calendario";
import { filtrarFeriadosNaJanela, obterJanelaFeriados } from "../helpers/obter-janela-feriados";
import { ocorrenciaSchema, OcorrenciaFormData } from "../helpers/validation";
import { CalendarioView } from "../helpers/constants";
import { ItemCalendario } from "../helpers/calendario-item.types";

interface DialogState {
  open: boolean;
  mode: "create" | "edit";
  ocorrenciaId?: string;
}

interface EventoDrawerState {
  open: boolean;
  eventoId: string | null;
  clickId: number;
}

interface OcorrenciaVisualizacaoState {
  open: boolean;
  ocorrenciaId: string | null;
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
  const isBackoffice = is("backoffice");
  const currentUser = useAppSelector(selectCurrentUser);

  const [view, setView] = useState<CalendarioView>("month");
  const [date, setDate] = useState(new Date());
  const [dialogState, setDialogState] = useState<DialogState>({ open: false, mode: "create" });
  const [eventoDrawer, setEventoDrawer] = useState<EventoDrawerState>({ open: false, eventoId: null, clickId: 0 });
  const [ocorrenciaVisualizacao, setOcorrenciaVisualizacao] = useState<OcorrenciaVisualizacaoState>({
    open: false,
    ocorrenciaId: null,
  });
  const [erro, setErro] = useState<string | null>(null);

  const { data: eventos = [], isLoading: carregandoEventos } = useListarEventosQuery();
  const { data: ocorrencias = [], isLoading: carregandoOcorrencias } = useListarOcorrenciasQuery();
  const { data: areas = [] } = useListarAreasQuery();

  const janelaFeriados = useMemo(() => obterJanelaFeriados(), []);
  const { data: feriadosAnoInicio = [] } = useListarFeriadosQuery(janelaFeriados.anoInicio);
  const { data: feriadosAnoFim = [] } = useListarFeriadosQuery(janelaFeriados.anoFim, {
    skip: janelaFeriados.anoFim === janelaFeriados.anoInicio,
  });

  const [criarOcorrencia, { isLoading: criando }] = useCriarOcorrenciaMutation();
  const [atualizarOcorrencia, { isLoading: atualizando }] = useAtualizarOcorrenciaMutation();
  const [removerOcorrencia] = useRemoverOcorrenciaMutation();

  const itens = useMemo<ItemCalendario[]>(() => {
    const feriados = filtrarFeriadosNaJanela([...feriadosAnoInicio, ...feriadosAnoFim], janelaFeriados);
    return [
      ...mapearEventosParaCalendario(eventos),
      ...mapearOcorrenciasParaCalendario(ocorrencias),
      ...mapearFeriadosParaCalendario(feriados),
    ];
  }, [eventos, ocorrencias, feriadosAnoInicio, feriadosAnoFim, janelaFeriados]);

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

  function abrirEdicaoOcorrencia(ocorrenciaId: string) {
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
    setOcorrenciaVisualizacao({ open: false, ocorrenciaId: null });
    setDialogState({ open: true, mode: "edit", ocorrenciaId });
  }

  function podeEditarOcorrencia(ocorrencia: OcorrenciaCalendario): boolean {
    if (isBackoffice) return true;
    if (!currentUser) return false;
    return ocorrencia.areas.some((area) => {
      const areaCompleta = areas.find((a) => a.id === area.id);
      return areaCompleta?.lideres.some((lider) => lider.id === currentUser.id) ?? false;
    });
  }

  function onSelectSlot(slotInfo: SlotInfo) {
    if (!podeGerenciar) return;
    abrirCriacao(slotInfo.start);
  }

  function onSelectEvent(item: ItemCalendario) {
    if (item.tipo === "feriado") return;
    if (item.tipo === "evento") {
      if (item.resource.eventoId) {
        setEventoDrawer((prev) => ({ open: true, eventoId: item.resource.eventoId!, clickId: prev.clickId + 1 }));
      }
      return;
    }
    if (!item.resource.ocorrenciaId) return;
    setOcorrenciaVisualizacao({ open: true, ocorrenciaId: item.resource.ocorrenciaId });
  }

  function onCloseEventoDrawer() {
    setEventoDrawer({ open: false, eventoId: null, clickId: 0 });
  }

  function onCloseOcorrenciaVisualizacao() {
    setOcorrenciaVisualizacao({ open: false, ocorrenciaId: null });
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
    ocorrencias,
    podeGerenciar,
    isLoading: carregandoEventos || carregandoOcorrencias,
    dialogState,
    eventoDrawer,
    ocorrenciaVisualizacao,
    control,
    isSubmitting: criando || atualizando,
    erro,
    onViewChange: (novaView: View) => setView(novaView as CalendarioView),
    onNavigate: setDate,
    onSelectSlot,
    onSelectEvent,
    onNovaOcorrencia,
    onCloseDialog,
    onCloseEventoDrawer,
    onCloseOcorrenciaVisualizacao,
    onEditarOcorrencia: abrirEdicaoOcorrencia,
    podeEditarOcorrencia,
    onSubmitForm,
    onDeleteOcorrencia,
  };
}
