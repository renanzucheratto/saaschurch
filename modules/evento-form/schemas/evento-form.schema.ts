import { z } from 'zod';
import { validateCPF, validateRG } from '../utils/validators';

export const eventoFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido. Use o formato (XX) XXXXX-XXXX'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  rg: z
    .string()
    .min(1, 'RG é obrigatório')
    .refine((val) => validateRG(val), {
      message: 'RG inválido',
    }),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine((val) => validateCPF(val), {
      message: 'CPF inválido',
    }),
  produtoId: z.string().optional(),
  selecaoUnicaProduto: z.boolean().optional(),
  hasProdutos: z.boolean().optional(),
  termo_assinado: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
}).refine((data) => {
  if (data.hasProdutos && data.selecaoUnicaProduto && !data.produtoId) {
    return false;
  }
  return true;
}, {
  message: 'Selecione um produto',
  path: ['produtoId'],
});

export type EventoFormSchema = z.infer<typeof eventoFormSchema>;
