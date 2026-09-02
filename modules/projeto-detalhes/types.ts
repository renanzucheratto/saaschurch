import type { StatusProjetoNome } from "@/types/projeto.types";

export interface StatusAction {
  novoStatus: StatusProjetoNome;
  titulo: string;
  descricao: string;
  confirmColor: "primary" | "error" | "success";
  variant: "contained" | "outlined";
  icone: string;
  /** Ação de avanço que só é liberada com os requisitos da etapa atendidos. */
  exigeRequisitos: boolean;
}

export interface RequisitoEtapa {
  label: string;
  atendido: boolean;
}

export interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export interface PermissoesProjeto {
  ehDono: boolean;
  ehBackoffice: boolean;
  podeAprovar: boolean;
  podeSolicitarReembolso: boolean;
  podeLiquidar: boolean;
  podeFinalizar: boolean;
}
