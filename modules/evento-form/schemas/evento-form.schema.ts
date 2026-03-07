import { z } from 'zod';

export const eventoFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  produtoId: z.string().min(1, 'Selecione um produto'),
  termo_assinado: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
});

export type EventoFormSchema = z.infer<typeof eventoFormSchema>;
