export interface PlanoDisponivel {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  valorMensal: string;
  feeEventoPercentual: string;
  feeEventoMinimo: string;
  feeEventoMaximo: string | null;
  limiteEventosAtivos: number | null;
  limiteUsuarios: number | null;
  features: Record<string, unknown>;
  atual: boolean;
  selecionavel: boolean;
  motivoIndisponivel: string | null;
}

export interface PlanosDisponiveisResponse {
  planoAtualId: string | null;
  planos: PlanoDisponivel[];
}

export type OrigemSplit = 'plano' | 'instituicao';

export interface RegraSplit {
  percentual: number;
  minimo: number;
  maximo: number | null;
  origem: {
    percentual: OrigemSplit;
    minimo: OrigemSplit;
    maximo: OrigemSplit;
  };
}

export interface PlanoAtualResponse {
  plano: {
    id: string;
    codigo: string;
    nome: string;
    descricao: string | null;
    valorMensal: string;
    feeEventoPercentual: string;
    feeEventoMinimo: string;
    feeEventoMaximo: string | null;
    features: Record<string, unknown>;
  } | null;
  planoAtribuidoEm: string | null;
  split: RegraSplit;
}

export interface AtualizarPlanoResponse {
  message: string;
  plano: PlanoAtualResponse['plano'];
  planoAtribuidoEm: string | null;
  split: RegraSplit;
}
