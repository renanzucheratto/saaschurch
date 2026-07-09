import type { AssinaturaStatus } from '@/types/plano.types';

type Severidade = 'info' | 'success' | 'warning' | 'error';

export const ROTULO_STATUS_ASSINATURA: Record<AssinaturaStatus, string> = {
  PENDING: 'Aguardando autorização',
  AUTHORIZED: 'Ativa',
  PAUSED: 'Pausada',
  CANCELLED: 'Cancelada',
};

export const SEVERIDADE_STATUS_ASSINATURA: Record<AssinaturaStatus, Severidade> = {
  PENDING: 'info',
  AUTHORIZED: 'success',
  PAUSED: 'warning',
  CANCELLED: 'error',
};

export const ROTULO_BADGE_GRATUITO = 'Gratuito';

export const ROTULO_BADGE_PILOTO = 'Parceiro Piloto — Gratuito';
