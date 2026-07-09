'use client';

import { usePlano } from '@/lib/hooks/use-plano';
import type { FeatureGateProps } from '../types';

const TOOLTIP_PADRAO = 'Recurso não incluído no seu plano atual.';

export function useFeatureGate({ feature, modo = 'ocultar', tooltip }: FeatureGateProps) {
  const { temFeature, carregando } = usePlano();

  return {
    carregando,
    liberado: temFeature(feature),
    modo,
    textoTooltip: tooltip ?? TOOLTIP_PADRAO,
  };
}
