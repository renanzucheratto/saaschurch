'use client';

import { useEffect, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useObterPagamentoQuery } from '@/config/redux/api/pagamentosApi';
import type { PagamentoStatus } from '@/types/pagamento.types';
import { POLLING_INTERVAL_MS, STATUS_FINAIS } from '../helpers/constants';

interface Entrada {
  pagamentoId: string | null;
  statusInicial: PagamentoStatus | null;
  expiraEm: string | null;
}

/**
 * Acompanha o PIX até um estado final ou até o QR expirar.
 *
 * O `pollingInterval` do RTK Query é desmontado junto com o componente, então não há
 * interval sobrevivendo à saída da página. `0` desliga o polling.
 */
export function usePollingPagamento({ pagamentoId, statusInicial, expiraEm }: Entrada) {
  const [expirado, setExpirado] = useState(false);

  const finalizadoNaCriacao = statusInicial ? STATUS_FINAIS.includes(statusInicial) : false;
  const podePollar = Boolean(pagamentoId) && !finalizadoNaCriacao && !expirado;

  const { data } = useObterPagamentoQuery(podePollar && pagamentoId ? pagamentoId : skipToken, {
    pollingInterval: podePollar ? POLLING_INTERVAL_MS : 0,
  });

  const status = data?.status ?? statusInicial;
  const finalizado = status ? STATUS_FINAIS.includes(status) : false;

  // Um prazo já vencido vira delay 0: o `setTimeout` dispara no próximo tick, o que
  // mantém `Date.now()` fora do render e a marcação de expiração fora do corpo do efeito.
  useEffect(() => {
    if (!expiraEm || finalizado) return;

    const restanteMs = Math.max(0, new Date(expiraEm).getTime() - Date.now());
    const timer = setTimeout(() => setExpirado(true), restanteMs);

    return () => clearTimeout(timer);
  }, [expiraEm, finalizado]);

  return {
    status,
    statusDetail: data?.statusDetail ?? null,
    finalizado,
    expirado: expirado && !finalizado,
  };
}
