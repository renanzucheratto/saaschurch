import { StatusProjetoNome } from '@/types/projeto.types';

type ChipColor = 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'default';

interface StatusInfo {
  label: string;
  color: ChipColor;
}

export const STATUS_PROJETO_INFO: Record<StatusProjetoNome, StatusInfo> = {
  em_analise: { label: 'Em análise', color: 'warning' },
  aprovado: { label: 'Aprovado', color: 'info' },
  recusado: { label: 'Recusado', color: 'error' },
  em_reembolso: { label: 'Em reembolso', color: 'secondary' },
  liquidado: { label: 'Liquidado', color: 'success' },
  finalizado: { label: 'Finalizado', color: 'default' },
};

/** Cores usadas nos gráficos de status (hex, pois o ECharts não lê o tema do MUI). */
export const STATUS_PROJETO_COR: Record<StatusProjetoNome, string> = {
  em_analise: '#f59e0b',
  aprovado: '#10b981',
  recusado: '#ef4444',
  em_reembolso: '#3b82f6',
  liquidado: '#8b5cf6',
  finalizado: '#6b7280',
};

export function getStatusInfo(nome?: StatusProjetoNome | null): StatusInfo {
  if (nome && STATUS_PROJETO_INFO[nome]) {
    return STATUS_PROJETO_INFO[nome];
  }
  return { label: 'Em análise', color: 'warning' };
}
