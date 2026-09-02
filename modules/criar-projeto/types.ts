import type { FieldPath } from "react-hook-form";
import type { CriarProjetoSchema } from "./schemas/criar-projeto.schema";

export type EtapaCriarProjetoId = "informacoes" | "detalhamento" | "orcamento" | "revisao";

export interface EtapaCriarProjeto {
  id: EtapaCriarProjetoId;
  titulo: string;
  descricao: string;
  /** Campos validados antes de liberar a próxima etapa. */
  campos: FieldPath<CriarProjetoSchema>[];
}

export interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}
