export type PagBankAccountStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface ContaPagBank {
  conectado: boolean;
  pagbankAccountId?: string;
  status?: PagBankAccountStatus;
  expiraEm?: string;
  ultimoRefreshEm?: string | null;
  ultimoErro?: string | null;
  conectadoEm?: string;
}

export interface ConectarResponse {
  authorizationUrl: string;
  expiraEm: string;
}

export type PagBankPagamentoStatus =
  | 'WAITING'
  | 'IN_ANALYSIS'
  | 'AUTHORIZED'
  | 'PAID'
  | 'DECLINED'
  | 'CANCELED'
  | 'REFUNDED';

export interface PagBankPagamento {
  id: string;
  instituicaoId: string;
  participanteId: string;
  participanteProdutoId: string | null;
  eventoId: string | null;
  pagbankOrderId: string | null;
  pagbankChargeId: string | null;
  externalReference: string;
  status: PagBankPagamentoStatus;
  statusDetail: string | null;
  valor: string;
  splitValor: string;
  splitPercentualAplicado: string;
  metodoPagamento: string | null;
  parcelasCartao: number;
  qrCodeTexto: string | null;
  qrCodeImagemUrl: string | null;
  boletoUrl: string | null;
  expiraEm: string | null;
  aprovadoEm: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListaPagamentosResponse {
  total: number;
  pagina: number;
  porPagina: number;
  pagamentos: PagBankPagamento[];
}

/** Motivos devolvidos pelo callback OAuth na query string. */
export type MotivoErroConexao =
  | 'autorizacao_recusada'
  | 'parametros_ausentes'
  | 'state_invalido'
  | 'falha_troca_token';

export type AssinaturaStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';

export interface StatusAssinatura {
  assinada: boolean;
  status?: AssinaturaStatus;
  plano?: { codigo: string; nome: string };
  valor?: number;
  cardBrand?: string | null;
  cardUltimosDigitos?: string | null;
  proximaCobranca?: string | null;
  canceladaEm?: string | null;
}
