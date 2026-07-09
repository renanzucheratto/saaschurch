'use client';

import { useMemo } from 'react';
import { formatarMoeda } from '@/config/helpers/formatar-moeda';
import { formatarPercentual } from '@/config/helpers/formatar-percentual';
import { formatarLimite } from '../../../helpers/formatar-limite';
import type { VitrinePlanosProps } from '../../../types';

export function useVitrinePlanos({ planos, codigoPlanoAtual }: VitrinePlanosProps) {
  const cartoes = useMemo(
    () =>
      planos.map((plano) => ({
        codigo: plano.codigo,
        nome: plano.nome,
        descricao: plano.descricao,
        atual: plano.codigo === codigoPlanoAtual,
        // Plano sem cobrança mostra "Gratuito" — nunca "R$ 0,00".
        preco: plano.cobrancaSaaS ? `${formatarMoeda(plano.valorMensal)}/mês` : 'Gratuito',
        fee: `${formatarPercentual(plano.feeEventoPercentual)} por transação de evento`,
        eventos: formatarLimite(plano.limites.eventosAtivos),
        usuarios: formatarLimite(plano.limites.usuarios),
      })),
    [planos, codigoPlanoAtual],
  );

  return { cartoes };
}
