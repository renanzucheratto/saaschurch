import type { AssinaturaStatus } from '@/types/plano.types';

export const ROTULO_ASSINATURA: Record<AssinaturaStatus, string> = {
  PENDING: 'Aguardando autorização',
  AUTHORIZED: 'Ativa',
  PAUSED: 'Pausada',
  CANCELLED: 'Cancelada',
};

export const COR_ASSINATURA: Record<AssinaturaStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  PENDING: 'info',
  AUTHORIZED: 'success',
  PAUSED: 'warning',
  CANCELLED: 'error',
};

export const AVISO_TROCA_PARA_PAGO =
  'A troca só vigora quando a igreja autorizar a assinatura no Mercado Pago. Até lá ela permanece no plano atual.';

export const AVISO_TROCA_PARA_GRATUITO =
  'A assinatura ativa desta instituição será cancelada no Mercado Pago. Esta ação não pode ser desfeita.';
