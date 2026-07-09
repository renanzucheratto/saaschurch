'use client';

import { traduzirStatusDetail } from '../../../helpers/traduzir-status-detail';
import type { ResultadoPagamentoProps } from '../../../types';

export function useResultadoPagamento({ status, statusDetail }: ResultadoPagamentoProps) {
  const aprovado = status === 'APPROVED';
  const recusado = status === 'REJECTED' || status === 'CANCELLED';

  return {
    aprovado,
    recusado,
    severidade: aprovado ? ('success' as const) : recusado ? ('error' as const) : ('info' as const),
    titulo: aprovado
      ? 'Pagamento aprovado'
      : recusado
        ? 'Pagamento recusado'
        : 'Pagamento em processamento',
    mensagem: traduzirStatusDetail(statusDetail),
  };
}
