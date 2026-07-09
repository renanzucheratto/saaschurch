import type { Plano } from '@/types/plano.types';

export interface PlanoBadgeProps {
  plano: Plano | undefined;
  /** Só muda o texto do badge. Nunca decide se há cobrança — isso é `cobrancaSaaS`. */
  parceiroPiloto?: boolean;
  size?: 'small' | 'medium';
}
