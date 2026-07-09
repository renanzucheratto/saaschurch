'use client';

import { useMemo, useState } from 'react';
import { useListarPagamentosEventoQuery } from '@/config/redux/api/pagamentosApi';
import { formatarMoeda } from '@/config/helpers/formatar-moeda';
import { formatarPercentual } from '@/config/helpers/formatar-percentual';
import { FILTRO_TODOS, METODO_PAGAMENTO, STATUS_PAGAMENTO } from '../helpers/constants';
import { montarColunas } from '../helpers/montar-colunas';
import { subtrairDecimal } from '../helpers/subtrair-decimal';
import type { LinhaPagamento, PagamentosTabProps } from '../types';

export function usePagamentosTab({ eventoId }: PagamentosTabProps) {
  const [filtroStatus, setFiltroStatus] = useState<string>(FILTRO_TODOS);

  const { data, isLoading } = useListarPagamentosEventoQuery(eventoId);

  const linhas = useMemo<LinhaPagamento[]>(() => {
    const pagamentos = data?.pagamentos ?? [];

    return pagamentos
      .filter((pagamento) => filtroStatus === FILTRO_TODOS || pagamento.status === filtroStatus)
      .map((pagamento) => ({
        id: pagamento.id,
        participante: pagamento.participante.nome ?? pagamento.participante.email ?? '—',
        valor: formatarMoeda(pagamento.valor),
        // Fee do snapshot: recalcular a partir do plano atual mostraria um número
        // que não bate com o extrato do Mercado Pago.
        applicationFee: formatarMoeda(pagamento.applicationFee),
        liquido: formatarMoeda(subtrairDecimal(pagamento.valor, pagamento.applicationFee)),
        feePercentualAplicado: formatarPercentual(pagamento.feePercentualAplicado),
        metodoPagamento: pagamento.metodoPagamento
          ? (METODO_PAGAMENTO[pagamento.metodoPagamento] ?? pagamento.metodoPagamento)
          : '—',
        status: STATUS_PAGAMENTO[pagamento.status].rotulo,
        data: pagamento.aprovadoEm
          ? new Date(pagamento.aprovadoEm).toLocaleDateString('pt-BR')
          : null,
      }));
  }, [data, filtroStatus]);

  // Os totais vêm prontos do backend, sobre os aprovados. Somar as linhas da grid
  // daria outro número quando há filtro aplicado.
  const totais = useMemo(
    () => [
      { rotulo: 'Bruto', valor: formatarMoeda(data?.totais.bruto ?? '0.00') },
      { rotulo: 'Fee retido', valor: formatarMoeda(data?.totais.fee ?? '0.00') },
      { rotulo: 'Líquido da igreja', valor: formatarMoeda(data?.totais.liquido ?? '0.00') },
    ],
    [data],
  );

  const opcoesStatus = useMemo(
    () => [
      { valor: FILTRO_TODOS, rotulo: 'Todos' },
      ...Object.entries(STATUS_PAGAMENTO).map(([valor, { rotulo }]) => ({ valor, rotulo })),
    ],
    [],
  );

  return {
    colunas: useMemo(() => montarColunas(), []),
    linhas,
    totais,
    opcoesStatus,
    filtroStatus,
    setFiltroStatus,
    carregando: isLoading,
    vazio: !isLoading && (data?.pagamentos.length ?? 0) === 0,
  };
}
