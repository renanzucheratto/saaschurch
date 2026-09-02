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
  data_inicio: z.string().min(1, 'Informe a data de início'),
  data_fim: z.string().optional(),
  areaIds: z.array(z.string()).min(1, 'Selecione ao menos uma área'),
  itens: z.array(itemProjetoSchema).min(1, 'Adicione ao menos um item ao projeto'),
}).refine(
  // As datas ficam no formato "yyyy-MM-dd", então a comparação de string é cronológica.
  (data) => !data.data_fim || data.data_fim >= data.data_inicio,
  { message: 'O término não pode ser anterior ao início', path: ['data_fim'] },
);

export type CriarProjetoSchema = z.infer<typeof criarProjetoSchema>;
export type ItemProjetoSchema = z.infer<typeof itemProjetoSchema>;
