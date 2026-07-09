'use client';

import { useCallback } from 'react';
import { useObterMeuPlanoQuery } from '@/config/redux/api/planosApi';
import type { FeatureKey, LimiteKey, Plano } from '@/types/plano.types';

export interface UsePlano {
  plano: Plano | undefined;
  parceiroPiloto: boolean;
  temFeature: (feature: FeatureKey) => boolean;
  limiteAtingido: (limite: LimiteKey) => boolean;
  assinaturaAtiva: boolean;
  /** `true` só quando o plano cobra assinatura **e** ela não está autorizada. */
  assinaturaInativa: boolean;
  carregando: boolean;
}

export function usePlano(): UsePlano {
  const { data, isLoading } = useObterMeuPlanoQuery();

  const plano = data?.plano;

  // RN-02: pergunta pela feature, nunca pelo código do plano. Chave ausente do JSON
  // é `false`, não erro — espelha o backend.
  const temFeature = useCallback(
    (feature: FeatureKey) => plano?.features?.[feature] === true,
    [plano],
  );

  const limiteAtingido = useCallback(
    (limite: LimiteKey) => {
      const max = plano?.limites?.[limite];

      if (max === null || max === undefined) return false;

      return (data?.uso?.[limite] ?? 0) >= max;
    },
    [plano, data],
  );

  // Plano gratuito é sempre "ativo": não há cobrança que possa falhar.
  const assinaturaAtiva =
    plano?.cobrancaSaaS === false || data?.assinatura?.status === 'AUTHORIZED';

  return {
    plano,
    parceiroPiloto: data?.parceiroPiloto ?? false,
    temFeature,
    limiteAtingido,
    assinaturaAtiva: Boolean(assinaturaAtiva),
    assinaturaInativa: plano?.cobrancaSaaS === true && !assinaturaAtiva,
    carregando: isLoading,
  };
}
