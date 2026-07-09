/** `"3.50"` → `"3,5%"`. Opera sobre a string do `Decimal`, sem `Number()`. */
export const formatarPercentual = (valor: string): string => {
  const [inteiro = '0', decimais = ''] = valor.trim().split('.');
  const casas = decimais.replace(/0+$/, '');

  return `${inteiro}${casas ? `,${casas}` : ''}%`;
};
