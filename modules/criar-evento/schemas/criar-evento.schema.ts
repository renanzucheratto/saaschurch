import { z } from "zod";
import { formatCurrencyToNumber } from "@/config/helpers/currency-mask";

export const produtoSchema = z.object({
  nome: z.string().min(1, "O nome do produto é obrigatório"),
  descricao: z.string().min(1, "A descrição do produto é obrigatória"),
  valor: z.string().min(1, "O valor do produto é obrigatório").refine((val) => formatCurrencyToNumber(val) > 0, {
    message: "O valor deve ser maior que 0",
  }),
});

export const criarEventoSchema = z.object({
  nome: z.string().min(1, "O nome do evento é obrigatório"),
  data_inicio: z.string().min(1, "A data de início é obrigatória"),
  data_fim: z.string().min(1, "A data de término é obrigatória"),
  descricao: z.string().optional(),
  imagem_url: z.string().optional(),
  selecao_unica_produto: z.boolean(),
  produtos: z.array(produtoSchema).optional(),
}).refine((data) => {
  if (data.data_inicio && data.data_fim) {
    return new Date(data.data_inicio) <= new Date(data.data_fim);
  }
  return true;
}, {
  message: "A data de término deve ser posterior à data de início",
  path: ["data_fim"],
});

export type CriarEventoSchema = z.infer<typeof criarEventoSchema>;
export type ProdutoForm = z.infer<typeof produtoSchema>;
