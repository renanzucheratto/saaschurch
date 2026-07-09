import type { PagamentoStatus } from '@/types/pagamento.types';

type CorChip = 'default' | 'info' | 'success' | 'error' | 'warning';

export const STATUS_PAGAMENTO: Record<PagamentoStatus, { cor: CorChip; rotulo: string }> = {
  PENDING: { cor: 'default', rotulo: 'Aguardando' },
  IN_PROCESS: { cor: 'info', rotulo: 'Processando' },
  APPROVED: { cor: 'success', rotulo: 'Aprovado' },
  REJECTED: { cor: 'error', rotulo: 'Recusado' },
  REFUNDED: { cor: 'warning', rotulo: 'Estornado' },
  CANCELLED: { cor: 'default', rotulo: 'Cancelado' },
};

export const METODO_PAGAMENTO: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  bolbradesco: 'Boleto',
};

export const FILTRO_TODOS = 'TODOS';
