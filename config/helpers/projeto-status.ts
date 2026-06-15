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

export function getStatusInfo(nome?: StatusProjetoNome | null): StatusInfo {
  if (nome && STATUS_PROJETO_INFO[nome]) {
    return STATUS_PROJETO_INFO[nome];
  }
  return { label: 'Em análise', color: 'warning' };
}
