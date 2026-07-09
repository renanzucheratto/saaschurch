'use client';

import { usePlano } from '@/lib/hooks/use-plano';

/**
 * O banner só aparece quando o plano **cobra** assinatura e ela não está autorizada.
 * Um parceiro piloto jamais o vê, mesmo com `GET /billing/assinaturas` devolvendo
 * `status: null` — em plano gratuito, isso é o estado normal, não uma falha.
 */
export function useBannerAssinatura() {
  const { assinaturaInativa, carregando } = usePlano();

  return {
    visivel: !carregando && assinaturaInativa,
  };
}
