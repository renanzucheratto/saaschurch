export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateInput = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Converte o valor "yyyy-MM-dd" usado nos formulários em Date (ou null). */
export const parseDateInput = (value?: string | null): Date | null => {
  if (!value) return null;
  const [ano, mes, dia] = value.split('-').map(Number);
  if (!ano || !mes || !dia) return null;
  const date = new Date(ano, mes - 1, dia);
  return isNaN(date.getTime()) ? null : date;
};

/** Converte um Date do calendário no valor "yyyy-MM-dd" usado nos formulários. */
export const toDateInput = (date?: Date | null): string => {
  if (!date || isNaN(date.getTime())) return '';
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mes}-${dia}`;
};

/**
 * Devolve o término que continua válido para o novo início. Como as datas estão
 * em "yyyy-MM-dd", a comparação de string é cronológica.
 */
export const resolveEndDate = (startDate: string, endDate?: string | null): string => {
  if (!endDate) return '';
  return startDate && endDate < startDate ? '' : endDate;
};
