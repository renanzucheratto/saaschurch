export type StatusProjetoNome =
  | 'em_analise'
  | 'aprovado'
  | 'recusado'
  | 'em_reembolso'
  | 'liquidado'
  | 'finalizado';

export type TipoAnexo = 'nota_fiscal' | 'comprovante_pagamento';

export interface ItemProjeto {
  id: string;
  projetoId?: string;
  nome: string;
  descricao?: string | null;
  quantidade: number;
  valor_unit: number;
  createdAt?: string;
}

export interface AnexoProjeto {
  id: string;
  projetoId: string;
  tipo: TipoAnexo;
  nome: string;
  url: string;
  tamanho?: number | null;
  createdAt: string | null;
}

export interface StatusProjeto {
  id: string;
  nome: StatusProjetoNome;
  justificativa: string | null;
  aprovadoPorId?: string | null;
}

export interface LiderResumo {
  id: string;
  nome: string;
  email: string;
}

export interface ProjetoListagem {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  liderUserId: string;
  lider: LiderResumo | null;
  eventoId: string | null;
  statusId: string | null;
  status: StatusProjeto | null;
  valor_total: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProjetoDetalhes extends ProjetoListagem {
  ideias: string | null;
  instituicaoId: string;
  itens: ItemProjeto[];
  anexos: AnexoProjeto[];
}
