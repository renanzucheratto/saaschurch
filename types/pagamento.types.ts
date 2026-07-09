export type PagamentoStatus =
  | 'PENDING'
  | 'IN_PROCESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface ProdutoCheckout {
  id: string;
  nome: string;
  descricao: string | null;
  /** `Decimal` serializado — string, nunca number. */
  valor: string;
}

export interface CheckoutConfig {
  /** Chave pública **da igreja**, obtida em runtime. Jamais de env. */
  publicKey: string;
  produtos: ProdutoCheckout[];
}

export interface CriarPagamentoBody {
  eventoId: string;
  participanteId: string;
  produtoIds: string[];
  token?: string;
  paymentMethodId: string;
  installments?: number;
  payer: {
    email: string;
    identification?: { type: string; number: string };
  };
  recaptchaToken: string;
}

export interface PixPagamento {
  qrCode: string;
  qrCodeBase64: string | null;
  expiraEm: string | null;
}

export interface CriarPagamentoResposta {
  pagamentoId: string;
  mpPaymentId: string;
  status: PagamentoStatus;
  statusDetail: string | null;
  pix?: PixPagamento;
}

export interface StatusPagamento {
  status: PagamentoStatus;
  statusDetail: string | null;
  aprovadoEm: string | null;
}

export interface PagamentoEvento {
  id: string;
  mpPaymentId: string;
  status: PagamentoStatus;
  statusDetail: string | null;
  valor: string;
  /** Snapshot do fee cobrado à época. Nunca recalcular a partir do plano atual. */
  applicationFee: string;
  feePercentualAplicado: string;
  metodoPagamento: string | null;
  parcelasCartao: number;
  aprovadoEm: string | null;
  createdAt: string;
  participante: { id: string; nome: string | null; email: string | null };
}

export interface PagamentosEvento {
  pagamentos: PagamentoEvento[];
  totais: { bruto: string; fee: string; liquido: string };
}
