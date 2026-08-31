import { z } from "zod";
import { formatCurrencyToNumber } from "@/config/helpers/currency-mask";

export const produtoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome do produto é obrigatório"),
  descricao: z.string().min(1, "A descrição do produto é obrigatória"),
  valor: z.string().min(1, "O valor do produto é obrigatório").refine((val) => formatCurrencyToNumber(val) > 0, {
    message: "O valor deve ser maior que 0",
  }),
  exigePagamento: z.boolean().optional(),
  oculto: z.boolean().optional(),
});

// Tipos que exigem lista de opcoes (multipla escolha, selecao unica e lista).
const TIPOS_COM_OPCOES = ["radio", "checkbox", "select"] as const;

export const campoCustomizadoSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional(),
  tipo: z.enum(["texto", "radio", "checkbox", "select", "aceite_termo", "email", "cpf", "rg", "telefone"]),
  obrigatorio: z.boolean().optional(),
  oculto: z.boolean().optional(),
  opcoes: z.array(z.string()).optional(),
  textoTermo: z.string().optional(),
}).superRefine((campo, ctx) => {
  if (campo.tipo === "aceite_termo") {
    if (!campo.textoTermo || campo.textoTermo.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O texto do aceite é obrigatório",
        path: ["textoTermo"],
      });
    }
    return;
  }

  if (!campo.label || campo.label.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O rótulo do campo é obrigatório",
      path: ["label"],
    });
  }

  if (!(TIPOS_COM_OPCOES as readonly string[]).includes(campo.tipo)) return;

  const opcoes = campo.opcoes ?? [];
  const preenchidas = opcoes.map((o) => o.trim()).filter((o) => o.length > 0);

  if (opcoes.some((o) => o.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Preencha todas as opções",
      path: ["opcoes"],
    });
    return;
  }

  if (preenchidas.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe pelo menos 2 opções",
      path: ["opcoes"],
    });
    return;
  }

  const duplicadas = new Set(preenchidas.map((o) => o.toLowerCase())).size !== preenchidas.length;
  if (duplicadas) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "As opções não podem se repetir",
      path: ["opcoes"],
    });
  }
});

export const faqItemSchema = z.object({
  pergunta: z.string().min(1, "A pergunta é obrigatória"),
  resposta: z.string().min(1, "A resposta é obrigatória"),
});

export const criarEventoSchema = z.object({
  nome: z.string().min(1, "O nome do evento é obrigatório"),
  data_inicio: z.string().min(1, "A data de início é obrigatória"),
  data_fim: z.string().min(1, "A data de término é obrigatória"),
  data_maxima_inscricao: z.string().optional(),
  limite_inscricoes: z.string().optional(),
  descricao: z.string().optional(),
  imagem_url: z.string().optional(),
  faq: z.array(faqItemSchema).optional(),
  selecao_unica_produto: z.boolean(),
  enviar_email_qr_code: z.boolean(),
  produtos: z.array(produtoSchema).optional(),
  campos_customizados: z.array(campoCustomizadoSchema).optional(),
  template_formulario: z.enum(["padrao", "empilhado"]),
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
export type CampoCustomizadoForm = z.infer<typeof campoCustomizadoSchema>;
export type FaqItemForm = z.infer<typeof faqItemSchema>;
