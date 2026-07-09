import type { FeatureKey, LimiteKey } from '@/types/plano.types';

export interface ErroPlanoTratado {
  titulo: string;
  mensagem: string;
  acao: 'UPGRADE' | 'REGULARIZAR_ASSINATURA' | 'NENHUMA';
}

const ROTULO_FEATURE: Record<FeatureKey, string> = {
  pagamentosOnline: 'Pagamentos online',
  relatorios: 'Relatórios',
  projetos: 'Projetos',
  areas: 'Áreas',
  camposCustomizados: 'Campos customizados',
  exportacao: 'Exportação',
};

const ROTULO_LIMITE: Record<LimiteKey, string> = {
  eventosAtivos: 'eventos ativos',
  usuarios: 'usuários',
};

interface CorpoErro {
  error?: string;
  feature?: FeatureKey;
  limite?: LimiteKey;
  max?: number;
  atual?: number;
  status?: string | null;
}

/** Extrai o corpo tipado de um erro do RTK Query sem assumir sua forma. */
function corpoDoErro(erro: unknown): CorpoErro | null {
  if (typeof erro !== 'object' || erro === null || !('data' in erro)) return null;

  const data = (erro as { data: unknown }).data;

  return typeof data === 'object' && data !== null ? (data as CorpoErro) : null;
}

/**
 * Traduz os erros tipados de `SPEC-BE-007`.
 *
 * O tratamento olha para `error` — o **código** —, nunca para a mensagem: o texto do
 * backend pode mudar a qualquer momento, o código é contrato.
 *
 * `402` (assinatura) e `403` (feature/limite) recebem ações diferentes de propósito:
 * assinatura inativa é problema de conta, limite atingido é convite a upgrade.
 */
export const tratarErroPlano = (erro: unknown): ErroPlanoTratado => {
  const corpo = corpoDoErro(erro);

  switch (corpo?.error) {
    case 'FEATURE_INDISPONIVEL':
      return {
        titulo: 'Recurso indisponível no seu plano',
        mensagem: corpo.feature
          ? `${ROTULO_FEATURE[corpo.feature] ?? corpo.feature} não está incluído no seu plano atual.`
          : 'Este recurso não está incluído no seu plano atual.',
        acao: 'UPGRADE',
      };

    case 'LIMITE_ATINGIDO':
      return {
        titulo: 'Limite do plano atingido',
        mensagem:
          corpo.limite && corpo.max !== undefined
            ? `Você atingiu o limite de ${corpo.max} ${ROTULO_LIMITE[corpo.limite] ?? corpo.limite} do seu plano.`
            : 'Você atingiu um limite do seu plano.',
        acao: 'UPGRADE',
      };

    case 'ASSINATURA_INATIVA':
      return {
        titulo: 'Assinatura inativa',
        mensagem:
          corpo.status === 'PAUSED'
            ? 'Sua assinatura está pausada. Regularize o pagamento para voltar a usar o sistema.'
            : 'Sua assinatura não está ativa. Fale com o suporte para regularizá-la.',
        acao: 'REGULARIZAR_ASSINATURA',
      };

    default:
      return {
        titulo: 'Não foi possível concluir a ação',
        mensagem: 'Tente novamente em alguns instantes.',
        acao: 'NENHUMA',
      };
  }
};
