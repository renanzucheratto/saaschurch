import { z } from "zod";
import { endOfDay, startOfDay } from "date-fns";
import { REGEX_HORA } from "./constants";

export const ocorrenciaExcecaoSchema = z
  .object({
    data: z.date(),
    horaInicio: z.string().regex(REGEX_HORA, "Horário inválido"),
    horaFim: z.string().regex(REGEX_HORA, "Horário inválido"),
  })
  .refine((excecao) => excecao.horaFim > excecao.horaInicio, {
    message: "Hora final deve ser após a inicial",
    path: ["horaFim"],
  });

export const ocorrenciaSchema = z
  .object({
    titulo: z.string().min(1, "Título é obrigatório"),
    de: z.date(),
    ate: z.date(),
    nota: z.string().optional(),
    areaIds: z.array(z.string()),
    excecoes: z.array(ocorrenciaExcecaoSchema),
  })
  .refine((dados) => dados.ate >= dados.de, {
    message: "Até deve ser igual ou posterior a De",
    path: ["ate"],
  })
  .refine(
    (dados) => {
      const inicioDia = startOfDay(dados.de);
      const fimDia = endOfDay(dados.ate);
      return dados.excecoes.every((excecao) => excecao.data >= inicioDia && excecao.data <= fimDia);
    },
    { message: "Exceções devem estar dentro do intervalo da ocorrência", path: ["excecoes"] }
  );

export type OcorrenciaFormData = z.infer<typeof ocorrenciaSchema>;
export type OcorrenciaExcecaoFormData = z.infer<typeof ocorrenciaExcecaoSchema>;
