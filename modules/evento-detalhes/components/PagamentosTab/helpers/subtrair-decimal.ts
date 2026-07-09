/**
 * Subtrai dois `Decimal` serializados como string, em centavos inteiros.
 *
 * Passar por `Number` para calcular o líquido reintroduziria o erro de ponto
 * flutuante que a serialização em string existe para evitar.
 */
const paraCentavos = (valor: string): number => {
  const negativo = valor.trim().startsWith('-');
  const [inteiro = '0', decimais = ''] = valor.trim().replace(/^-/, '').split('.');
  const centavos = Number(inteiro) * 100 + Number(`${decimais}00`.slice(0, 2));

  return negativo ? -centavos : centavos;
};

export const subtrairDecimal = (a: string, b: string): string => {
  const centavos = paraCentavos(a) - paraCentavos(b);
  const sinal = centavos < 0 ? '-' : '';
  const absoluto = Math.abs(centavos);

  return `${sinal}${Math.trunc(absoluto / 100)}.${String(absoluto % 100).padStart(2, '0')}`;
};
