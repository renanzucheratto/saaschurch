import type { CriarPagamentoResposta, PagamentoStatus, PixPagamento } from '@/types/pagamento.types';

export interface CheckoutEventoProps {
  eventoId: string;
  participanteId: string;
  produtoIds: string[];
  onConcluido?: (status: PagamentoStatus) => void;
}

/** Dados que o Payment Brick devolve ao submeter. */
export interface DadosBrick {
  token?: string;
  payment_method_id: string;
  installments?: number;
  payer?: {
    email?: string;
    identification?: { type?: string; number?: string };
  };
}

export interface PaymentBrickProps {
  publicKey: string;
  valor: string;
  enviando: boolean;
  onSubmit: (dados: DadosBrick) => void;
}

export interface PixQrCodeProps {
  pix: PixPagamento;
  expirado: boolean;
}

export interface ResultadoPagamentoProps {
  status: PagamentoStatus;
  statusDetail: string | null;
  onTentarNovamente: () => void;
}

export type PagamentoCriado = CriarPagamentoResposta;
