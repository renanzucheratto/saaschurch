import { z } from 'zod';
import { validateCPF, validateRG } from '../utils/validators';
import { CampoCustomizado } from '@/types/evento.types';

// Schema dos campos padrão (usado quando o evento NÃO tem campos customizados)
const camposPadraoSchema = z.object({
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

/**
 * Constrói o schema do formulário público de inscrição.
 * - Sem campos customizados: valida os campos padrão (comportamento original).
 * - Com pelo menos 1 campo customizado: ignora os campos padrão e valida
 *   apenas os campos customizados visíveis (não ocultos).
 */
export function buildEventoFormSchema(campos: CampoCustomizado[] = []) {
  const temCamposCustomizados = campos.length > 0;

  if (!temCamposCustomizados) {
    return camposPadraoSchema;
  }

  const camposVisiveis = campos.filter((c) => !c.oculto);

  const camposShape: Record<string, z.ZodTypeAny> = {};
  for (const campo of camposVisiveis) {
    switch (campo.tipo) {
      case 'checkbox':
        camposShape[campo.id] = campo.obrigatorio
          ? z.array(z.string()).min(1, `${campo.label} é obrigatório`)
          : z.array(z.string()).optional();
        break;
      case 'aceite_termo':
        camposShape[campo.id] = campo.obrigatorio
          ? z.boolean().refine((v) => v === true, `${campo.textoTermo || campo.label} é obrigatório`)
          : z.boolean().optional();
        break;
      case 'email':
        camposShape[campo.id] = campo.obrigatorio
          ? z.string().min(1, `${campo.label} é obrigatório`).email('E-mail inválido')
          : z.string().email('E-mail inválido').or(z.literal('')).optional();
        break;
      case 'cpf':
        camposShape[campo.id] = campo.obrigatorio
          ? z.string().min(1, `${campo.label} é obrigatório`).refine(validateCPF, { message: 'CPF inválido' })
          : z.string().refine((val) => val === '' || validateCPF(val), { message: 'CPF inválido' }).optional();
        break;
      case 'rg':
        camposShape[campo.id] = campo.obrigatorio
          ? z.string().min(1, `${campo.label} é obrigatório`).refine(validateRG, { message: 'RG inválido' })
          : z.string().refine((val) => val === '' || validateRG(val), { message: 'RG inválido' }).optional();
        break;
      case 'telefone':
        camposShape[campo.id] = campo.obrigatorio
          ? z.string().min(1, `${campo.label} é obrigatório`)
              .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido. Use o formato (XX) XXXXX-XXXX')
          : z.string().regex(/^$|^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido').optional();
        break;
      case 'texto':
      case 'radio':
      case 'select':
      default:
        camposShape[campo.id] = campo.obrigatorio
          ? z.string().min(1, `${campo.label} é obrigatório`)
          : z.string().optional();
        break;
    }
  }

  return z.object({
    produtoId: z.string().optional(),
    selecaoUnicaProduto: z.boolean().optional(),
    hasProdutos: z.boolean().optional(),
    respostas_customizadas: z.object(camposShape).optional(),
  }).refine((data) => {
    if (data.hasProdutos && data.selecaoUnicaProduto && !data.produtoId) {
      return false;
    }
    return true;
  }, {
    message: 'Selecione um produto',
    path: ['produtoId'],
  });
}

// Mantido por compatibilidade — equivale ao schema sem campos customizados.
export const eventoFormSchema = camposPadraoSchema;

export interface EventoFormValues {
  nome?: string;
  telefone?: string;
  email?: string;
  rg?: string;
  cpf?: string;
  produtoId?: string;
  selecaoUnicaProduto?: boolean;
  hasProdutos?: boolean;
  termo_assinado?: boolean;
  respostas_customizadas?: Record<string, string | string[] | boolean>;
}

export type EventoFormSchema = EventoFormValues;
