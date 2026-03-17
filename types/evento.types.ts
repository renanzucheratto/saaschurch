export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
}

export interface EventoListagem {
  id: string;
  nome: string;
  data_inicio: string | null;
  data_fim: string | null;
  descricao: string;
  selecao_unica_produto: boolean;
  imagem_url: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  quantidadeParticipantes: number;
  produtos: Produto[];
}

export interface EventoDetalhes {
  id: string;
  nome: string;
  data_inicio: string | null;
  data_fim: string | null;
  descricao: string;
  selecao_unica_produto: boolean;
  imagem_url: string | null;
  userId: string | null;
  instituicaoId: string;
  createdAt: string;
  updatedAt: string;
  produtos: Produto[];
}

export interface ProdutoParticipante {
  id: string; // ID da relação ParticipanteProdutos
  produtoId: string; // ID do produto em si
  nome: string;
  valor: number;
}

export interface Participante {
  id: string;
  eventoId: string;
  nome: string;
  email: string;
  telefone: string;
  rg: string;
  cpf: string;
  termo_assinado: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  produtos: ProdutoParticipante[];
}
