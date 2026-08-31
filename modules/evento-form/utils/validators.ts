export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

/** Valida uma data no formato dd/mm/aaaa, conferindo se o dia existe no mes. */
export const validateDataBR = (data: string): boolean => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data.trim());
  if (!match) return false;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const ano = Number(match[3]);

  if (mes < 1 || mes > 12) return false;
  if (ano < 1900 || ano > 2200) return false;

  const diasNoMes = new Date(ano, mes, 0).getDate();
  return dia >= 1 && dia <= diasNoMes;
};

export const validateRG = (rg: string): boolean => {
  const cleanRG = rg.replace(/\D/g, '');
  
  if (cleanRG.length < 7 || cleanRG.length > 9) return false;
  
  if (/^(\d)\1+$/.test(cleanRG)) return false;
  
  return true;
};
