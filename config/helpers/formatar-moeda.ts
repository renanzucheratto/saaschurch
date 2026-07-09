/**
 * Formata um `Decimal` serializado como string, sem passar por `Number()`.
 *
 * A API manda dinheiro como string justamente para não perder precisão; convertê-lo
 * para float aqui reintroduziria o erro que a serialização evitou.
 */
export const formatarMoeda = (valor: string): string => {
  const bruto = valor.trim();
  const negativo = bruto.startsWith('-');
  const [inteiro = '0', decimais = ''] = bruto.replace(/^-/, '').split('.');

  const centavos = `${decimais}00`.slice(0, 2);
  const milhares = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${negativo ? '-' : ''}R$ ${milhares || '0'},${centavos}`;
};
