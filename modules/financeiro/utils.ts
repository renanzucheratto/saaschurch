import type { CampoRegra, OperadorRegra } from '@/types/financeiro.types';

export const CAMPO_LABELS: Record<CampoRegra, string> = {
  historico: 'Histórico',
  descricao: 'Descrição',
  codigo: 'Código do banco',
  valor: 'Valor',
};

export const OPERADOR_LABELS: Record<OperadorRegra, string> = {
  contains: 'contém',
  equals: 'é igual a',
  starts_with: 'começa com',
  greater_than: 'maior que',
  less_than: 'menor que',
};

export const OPERADORES_TEXTO: OperadorRegra[] = ['contains', 'equals', 'starts_with'];
export const OPERADORES_NUMERO: OperadorRegra[] = ['equals', 'greater_than', 'less_than'];

export function formatDataBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function descreverRegra(regra: {
  campo: CampoRegra;
  operador: OperadorRegra;
  valor: string;
}): string {
  return `${CAMPO_LABELS[regra.campo]} ${OPERADOR_LABELS[regra.operador]} "${regra.valor}"`;
}
