'use client';

import type { PlanoBadgeProps } from '../types';

export function usePlanoBadge({ plano, parceiroPiloto = false }: PlanoBadgeProps) {
  // A decisão de "é gratuito?" olha para `cobrancaSaaS`, nunca para o código do plano.
  const gratuito = plano?.cobrancaSaaS === false;

  const rotulo = !plano
    ? ''
    : gratuito
      ? parceiroPiloto
        ? 'Parceiro Piloto — Gratuito'
        : `${plano.nome} — Gratuito`
      : plano.nome;

  return { gratuito, rotulo, visivel: Boolean(plano) };
}
