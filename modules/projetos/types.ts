import type { StatusProjetoNome } from "@/types/projeto.types";

export interface ResumoStatus {
  status: StatusProjetoNome;
  label: string;
  cor: string;
  quantidade: number;
  valor: number;
}

export interface PontoMensal {
  ano: number;
  mes: number;
  label: string;
  ehMesAtual: boolean;
  totalPlanejado: number;
  aReembolsar: number;
}

export interface ResumoProjetos {
  /** Soma do valor planejado dos projetos que não foram recusados. */
  totalPlanejado: number;
  qtdAtivos: number;
  /** Projetos que ainda estão percorrendo o fluxo (sem recusados e finalizados). */
  qtdEmAndamento: number;
  /** Soma do valor dos projetos aprovados ou em reembolso — dinheiro a devolver. */
  aguardandoReembolso: number;
  qtdAguardando: number;
  /** Soma do valor já liquidado ou finalizado. */
  jaReembolsado: number;
  totalProjetos: number;
  porStatus: ResumoStatus[];
  serieMensal: PontoMensal[];
}
