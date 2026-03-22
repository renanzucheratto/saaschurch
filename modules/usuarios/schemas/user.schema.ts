import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  telefone: z.string().optional(),
  rg: z.string().optional(),
  cpf: z.string().optional(),
  userType: z.enum(['membro', 'backoffice']),
});

export type UserFormData = z.infer<typeof userSchema>;
