import type { StatusProjetoNome } from "@/types/projeto.types";

/** Ordem em que os status aparecem no gráfico, seguindo o fluxo do projeto. */
export const ORDEM_STATUS: StatusProjetoNome[] = [
  "em_analise",
  "aprovado",
  "em_reembolso",
  "liquidado",
  "finalizado",
  "recusado",
];

/** Quantidade de meses exibidos nos gráficos de linha dos cards. */
export const MESES_SERIE = 6;

/** Projetos que ainda percorrem o fluxo — recusados e finalizados ficam de fora. */
export const STATUS_EM_ANDAMENTO: StatusProjetoNome[] = [
  "em_analise",
  "aprovado",
  "em_reembolso",
  "liquidado",
];

export const STATUS_AGUARDANDO_REEMBOLSO: StatusProjetoNome[] = ["aprovado", "em_reembolso"];
export const STATUS_REEMBOLSADO: StatusProjetoNome[] = ["liquidado", "finalizado"];
