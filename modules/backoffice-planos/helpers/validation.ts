import { z } from 'zod';

export const trocarPlanoSchema = z.object({
  planoCodigo: z.string().min(1, 'Selecione um plano'),
  motivo: z.string().min(10, 'Descreva o motivo com pelo menos 10 caracteres'),
});

export type TrocarPlano = z.infer<typeof trocarPlanoSchema>;
