import type { StatusConexaoMercadoPago } from '@/types/payment-connect.types';

export interface EstadoConexao {
  severidade: 'info' | 'success' | 'warning';
  cta: string;
  mensagem: string;
  /** `true` quando o CTA desconecta em vez de conectar. */
  conectado: boolean;
}

export const ESTADOS_CONEXAO: Record<StatusConexaoMercadoPago, EstadoConexao> = {
  NAO_CONECTADO: {
    severidade: 'info',
    cta: 'Conectar Mercado Pago',
    mensagem: 'Eventos pagos estão indisponíveis até conectar uma conta.',
    conectado: false,
  },
  PENDING: {
    severidade: 'info',
    cta: 'Continuar conexão',
    mensagem: 'Autorização iniciada, aguardando confirmação no Mercado Pago.',
    conectado: false,
  },
  ACTIVE: {
    severidade: 'success',
    cta: 'Desconectar',
    mensagem: 'Conta conectada. Os pagamentos de evento caem direto nela.',
    conectado: true,
  },
  EXPIRED: {
    severidade: 'warning',
    cta: 'Reconectar',
    mensagem: 'O acesso expirou. Pagamentos de evento estão bloqueados.',
    conectado: false,
  },
  REVOKED: {
    severidade: 'warning',
    cta: 'Reconectar',
    mensagem: 'Acesso revogado no Mercado Pago. Reconecte para voltar a receber.',
    conectado: false,
  },
};
