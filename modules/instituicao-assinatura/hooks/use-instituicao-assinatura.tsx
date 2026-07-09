'use client';

import { useCallback, useMemo } from 'react';
import {
  useCancelarAssinaturaMutation,
  useObterAssinaturaQuery,
} from '@/config/redux/api/assinaturaApi';
import { useListarPlanosQuery, useObterMeuPlanoQuery } from '@/config/redux/api/planosApi';
import { formatarPercentual } from '@/config/helpers/formatar-percentual';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { Assinatura, RespostaAssinatura } from '@/types/plano.types';
import { formatarUso } from '../helpers/formatar-uso';

function assinaturaOuNula(resposta: RespostaAssinatura | undefined): Assinatura | null {
  return resposta && resposta.status !== null ? resposta : null;
}

export function useInstituicaoAssinatura() {
  const { is } = usePermissions();

  const { data: meuPlano, isLoading: carregandoPlano, isError } = useObterMeuPlanoQuery();
  const { data: respostaAssinatura, isLoading: carregandoAssinatura } = useObterAssinaturaQuery();
  const { data: catalogo, isLoading: carregandoCatalogo } = useListarPlanosQuery();

  const [cancelar, { isLoading: cancelando }] = useCancelarAssinaturaMutation();

  const plano = meuPlano?.plano;
  const assinatura = assinaturaOuNula(respostaAssinatura);

  const onCancelar = useCallback(
    (motivo: string) => {
      if (!assinatura) return;
      cancelar({ id: assinatura.id, motivo });
    },
    [assinatura, cancelar],
  );

  // O fee aparece mesmo em plano gratuito: gratuidade de assinatura e taxa de
  // transação são eixos independentes.
  const metricas = useMemo(() => {
    if (!plano || !meuPlano) return [];

    return [
      {
        rotulo: 'Fee de evento',
        valor: formatarPercentual(plano.feeEventoPercentual),
      },
      {
        rotulo: 'Eventos ativos',
        valor: formatarUso(meuPlano.uso.eventosAtivos, plano.limites.eventosAtivos),
      },
      {
        rotulo: 'Usuários',
        valor: formatarUso(meuPlano.uso.usuarios, plano.limites.usuarios),
      },
    ];
  }, [plano, meuPlano]);

  return {
    plano,
    metricas,
    parceiroPiloto: meuPlano?.parceiroPiloto ?? false,
    assinatura,
    // A seção de cobrança some quando o plano não cobra — a decisão é `cobrancaSaaS`,
    // nunca o código do plano nem a flag de parceiro piloto.
    exibirCobranca: plano?.cobrancaSaaS === true,
    planos: catalogo?.planos ?? [],
    podeCancelar: is('backoffice'),
    cancelando,
    onCancelar,
    carregando: carregandoPlano || carregandoAssinatura || carregandoCatalogo,
    // Assinatura ausente em plano gratuito não é erro; só a falha de `/planos/meu` é.
    erro: isError,
  };
}
