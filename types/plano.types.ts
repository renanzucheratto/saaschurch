export interface PlanoFeatures {
  pagamentosOnline: boolean;
  relatorios: boolean;
  projetos: boolean;
  areas: boolean;
  camposCustomizados: boolean;
  exportacao: boolean;
}

export type FeatureKey = keyof PlanoFeatures;

export type LimiteKey = 'eventosAtivos' | 'usuarios';

/**
 * Valores monetários chegam como **string**: a API serializa `Decimal` assim para
 * preservar precisão. Nunca `Number()` antes de formatar.
 */
export interface Plano {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  cobrancaSaaS: boolean;
  valorMensal: string;
  valorAnual: string | null;
  feeEventoPercentual: string;
  feeEventoMinimo: string;
  feeEventoMaximo: string | null;
  features: PlanoFeatures;
  limites: {
    eventosAtivos: number | null;
    usuarios: number | null;
  };
  ativo: boolean;
  ordem: number;
}

export interface UsoPlano {
  eventosAtivos: number;
  usuarios: number;
}

export interface MeuPlano {
  plano: Plano;
  uso: UsoPlano;
  /** `null` é o estado normal de um plano gratuito, não um erro. */
  assinatura: Assinatura | null;
  parceiroPiloto: boolean;
  planoAtribuidoEm: string | null;
}

export type AssinaturaStatus = 'PENDING' | 'AUTHORIZED' | 'PAUSED' | 'CANCELLED';

export interface Assinatura {
  id: string;
  status: AssinaturaStatus;
  valor: string;
  periodicidade: string;
  proximaCobranca: string | null;
  canceladaEm: string | null;
  motivoCancelamento: string | null;
  plano: Plano;
  /** Presente só enquanto `PENDING`: link para a igreja autorizar no Mercado Pago. */
  initPoint: string | null;
}

/** `GET /billing/assinaturas` em plano gratuito devolve `status: null` com 200. */
export interface AssinaturaAusente {
  status: null;
  motivo: 'PLANO_SEM_COBRANCA' | 'SEM_ASSINATURA';
}

export type RespostaAssinatura = Assinatura | AssinaturaAusente;

export interface AtribuirPlanoResposta {
  plano: Plano;
  assinaturaNecessaria: boolean;
  initPoint?: string;
}
