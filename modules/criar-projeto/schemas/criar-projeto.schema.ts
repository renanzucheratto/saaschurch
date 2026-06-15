import { z } from 'zod';

export const itemProjetoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do item'),
  descricao: z.string().optional(),
  // quantidade é mantida como string (input) e convertida no submit
  quantidade: z
    .string()
    .min(1, 'Informe a quantidade')
    .refine((v) => Number(v) >= 1, 'Mínimo 1'),
  // valor unitário é mantido como string formatada (R$) e convertido no submit
  valor_unit: z.string().min(1, 'Informe o valor'),
});

export const criarProjetoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do projeto'),
  descricao: z.string().optional(),
  ideias: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  itens: z.array(itemProjetoSchema).min(1, 'Adicione ao menos um item ao projeto'),
});

export type CriarProjetoSchema = z.infer<typeof criarProjetoSchema>;
export type ItemProjetoSchema = z.infer<typeof itemProjetoSchema>;
