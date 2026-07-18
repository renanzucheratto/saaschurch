export type TipoCategoria = 'RECEITA' | 'DESPESA';
export type TipoTransacao = 'CREDITO' | 'DEBITO';
export type CampoRegra = 'historico' | 'descricao' | 'codigo' | 'valor';
export type OperadorRegra = 'contains' | 'equals' | 'starts_with' | 'greater_than' | 'less_than';

export interface ContaBancaria {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  digito: string | null;
  descricao: string | null;
  saldoInicial: string | number;
  dataSaldoInicial: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaldoConta {
  saldoInicial: number;
  dataSaldoInicial: string | null;
  totalCreditos: number;
  totalDebitos: number;
  saldoAtual: number;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  createdAt: string;
  updatedAt: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  cnpjCpf: string | null;
  telefone: string | null;
  email: string | null;
  observacao: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumoNome {
  id: string;
  nome: string;
}

export interface RegraConciliacao {
  id: string;
  nome: string | null;
  campo: CampoRegra;
  operador: OperadorRegra;
  valor: string;
  tipoTransacao: TipoTransacao | null;
  categoriaId: string | null;
  fornecedorId: string | null;
  projetoId: string | null;
  areaId: string | null;
  categoria?: (ResumoNome & { tipo: TipoCategoria }) | null;
  fornecedor?: ResumoNome | null;
  projeto?: ResumoNome | null;
  area?: ResumoNome | null;
  prioridade: number;
  ativo: boolean;
  createdAt: string;
}

export interface TransacaoBancaria {
  id: string;
  contaBancariaId: string;
  dataMovimento: string;
  valor: string;
  tipo: TipoTransacao;
  codigoBanco: string;
  descricaoBanco: string;
  descricaoAbrev: string | null;
  historico: string | null;
  documento: string | null;
  saldoApos: string | null;
  conciliada: boolean;
  regraAplicadaId: string | null;
  categoriaId: string | null;
  fornecedorId: string | null;
  projetoId: string | null;
  areaId: string | null;
  categoria?: (ResumoNome & { tipo: TipoCategoria }) | null;
  fornecedor?: ResumoNome | null;
  projeto?: ResumoNome | null;
  area?: ResumoNome | null;
  contaBancaria?: {
    id: string;
    banco: string;
    agencia: string;
    conta: string;
    descricao: string | null;
  } | null;
}

export interface TransacoesResponse {
  transacoes: TransacaoBancaria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransacoesFiltros {
  contaId?: string;
  dataInicio?: string;
  dataFim?: string;
  status?: 'pendente' | 'conciliada';
  tipo?: TipoTransacao;
  categoriaId?: string;
  fornecedorId?: string;
  projetoId?: string;
  areaId?: string;
  page?: number;
  limit?: number;
}

export interface ResultadoImportacao {
  importadas: number;
  duplicadasIgnoradas: number;
  classificadas: number;
  pendentes: number;
  foraDoPeriodo?: number;
  ignoradasPorSaldoInicial?: number;
}

export interface ClassificarPayload {
  id: string;
  categoriaId?: string | null;
  fornecedorId?: string | null;
  projetoId?: string | null;
  areaId?: string | null;
  criarRegra?: {
    nome?: string;
    campo: CampoRegra;
    operador: OperadorRegra;
    valor: string;
    prioridade?: number;
  };
}
