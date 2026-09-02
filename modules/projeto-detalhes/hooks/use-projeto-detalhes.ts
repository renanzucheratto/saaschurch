"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useObterProjetoQuery } from "@/config/redux/api/projetosApi";
import { useAppSelector } from "@/config/redux/store";
import { selectCurrentUser } from "@/config/redux/slices/authSlice";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { getStatusInfo } from "@/config/helpers/projeto-status";
import { ETAPAS_PROJETO, getIndiceEtapa } from "@/config/helpers/projeto-fluxo";
import { getAcoesStatus } from "../helpers/get-acoes-status";
import { getRequisitosEtapa } from "../helpers/get-requisitos-etapa";
import {
  STATUS_COM_COMPROVANTES,
  STATUS_COM_NOTAS,
  STATUS_GERENCIA_COMPROVANTES,
  STATUS_GERENCIA_NOTAS,
} from "../helpers/constants";
import type { AlertState, StatusAction } from "../types";

export const useProjetoDetalhes = () => {
  const params = useParams();
  const router = useRouter();
  const projetoId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { data: projeto, isLoading, isFetching } = useObterProjetoQuery(projetoId, {
    skip: !projetoId,
  });
  const currentUser = useAppSelector(selectCurrentUser);
  const { is, can } = usePermissions();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSuccess = (message: string) => setAlert({ open: true, message, severity: "success" });
  const showError = (message: string) => setAlert({ open: true, message, severity: "error" });
  const fecharAlert = () => setAlert((atual) => ({ ...atual, open: false }));

  const status = projeto?.status?.nome || "em_analise";
  const statusInfo = getStatusInfo(status);
  const ehRecusado = status === "recusado";

  const ehDono = projeto?.liderUserId === currentUser?.id;
  const ehBackoffice = is("backoffice");
  const ehLiderOuBackoffice = is("lider", "backoffice");
  const podeAprovar = can("aprovarProjeto");

  const podeEditar = (ehDono || ehBackoffice) && status === "em_analise";

  const acoes = useMemo(
    () => getAcoesStatus({ status, ehDono, ehBackoffice, ehLiderOuBackoffice, podeAprovar }),
    [status, ehDono, ehBackoffice, ehLiderOuBackoffice, podeAprovar],
  );

  const requisitos = useMemo(
    () => getRequisitosEtapa(status, projeto?.anexos || []),
    [status, projeto?.anexos],
  );

  const temPendencia = requisitos.some((requisito) => !requisito.atendido);

  const indiceEtapa = getIndiceEtapa(status);
  const etapaAtual = ETAPAS_PROJETO[indiceEtapa];

  return {
    projeto,
    isLoading,
    status,
    statusInfo,
    ehRecusado,
    etapas: ETAPAS_PROJETO,
    indiceEtapa,
    etapaAtual,
    acoes,
    requisitos,
    temPendencia,
    // Enquanto o projeto é revalidado (ex.: após anexar ou mudar status) as ações ficam
    // travadas para não avançar duas etapas com dados desatualizados.
    acoesDesabilitadas: isFetching,
    podeEditar,
    mostrarNotas: STATUS_COM_NOTAS.includes(status),
    podeGerenciarNotas: (ehDono || ehBackoffice) && STATUS_GERENCIA_NOTAS.includes(status),
    mostrarComprovantes: STATUS_COM_COMPROVANTES.includes(status),
    podeGerenciarComprovantes:
      ehLiderOuBackoffice && STATUS_GERENCIA_COMPROVANTES.includes(status),
    drawerOpen,
    abrirDrawer: () => setDrawerOpen(true),
    fecharDrawer: () => setDrawerOpen(false),
    statusAction,
    selecionarAcao: setStatusAction,
    limparAcao: () => setStatusAction(null),
    alert,
    fecharAlert,
    showSuccess,
    showError,
    voltarParaListagem: () => router.push("/projetos"),
  };
};
