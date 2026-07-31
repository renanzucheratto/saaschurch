export type MercadoPagoAccountStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface ContaMercadoPago {
  conectado: boolean;
  mpUserId?: string;
  status?: MercadoPagoAccountStatus;
  expiraEm?: string;
  refreshExpiraEm?: string | null;
  ultimoRefreshEm?: string | null;
  ultimoErro?: string | null;
  conectadoEm?: string;
}

export interface ConectarResponse {
  authorizationUrl: string;
  expiraEm: string;
}

export type MpPagamentoStatus =
  | 'PENDING'
  | 'IN_PROCESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'CHARGED_BACK';

export interface MpPagamento {
  id: string;
  instituicaoId: string;
  participanteId: string;
  participanteProdutoId: string | null;
  eventoId: string | null;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  externalReference: string;
  status: MpPagamentoStatus;
  statusDetail: string | null;
  valor: string;
  splitValor: string;
  splitPercentualAplicado: string;
  metodoPagamento: string | null;
  parcelasCartao: number;
  initPoint: string | null;
  expiraEm: string | null;
  aprovadoEm: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListaPagamentosResponse {
  total: number;
  pagina: number;
  porPagina: number;
  pagamentos: MpPagamento[];
}

/** Motivos devolvidos pelo callback OAuth na query string. */
export type MotivoErroConexao =
  | 'autorizacao_recusada'
  | 'parametros_ausentes'
  | 'state_invalido'
  | 'falha_troca_token';
