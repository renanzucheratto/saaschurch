import type { PagamentoStatus } from '@/types/pagamento.types';

export const POLLING_INTERVAL_MS = 4000;

export const PIX_EXPIRACAO_MIN = 30;

/** Uma vez nestes estados, o MP não muda mais o pagamento sozinho: pare o polling. */
export const STATUS_FINAIS: PagamentoStatus[] = [
  'APPROVED',
  'REJECTED',
  'REFUNDED',
  'CANCELLED',
];

export const MENSAGEM_SEM_CONTA_MP =
  'Esta igreja ainda não configurou pagamentos online.';
