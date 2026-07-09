import type { ReactNode } from 'react';
import type { FeatureKey } from '@/types/plano.types';

export type ModoFeatureGate = 'ocultar' | 'desabilitar';

export interface FeatureGateProps {
  feature: FeatureKey;
  /** `ocultar` remove o filho da árvore; `desabilitar` o mantém, inerte, com tooltip. */
  modo?: ModoFeatureGate;
  tooltip?: string;
  children: ReactNode;
  fallback?: ReactNode;
}
