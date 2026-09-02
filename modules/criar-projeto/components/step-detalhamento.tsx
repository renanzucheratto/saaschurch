"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import RichTextEditor from "@/modules/criar-evento/components/RichTextEditor";
import type { CriarProjetoSchema } from "../schemas/criar-projeto.schema";

interface Props {
  form: UseFormReturn<CriarProjetoSchema>;
}

export const StepDetalhamento = ({ form }: Props) => (
  <Controller
    name="ideias"
    control={form.control}
    render={({ field }) => (
      <RichTextEditor
        label="Descreva as ideias, objetivos e o planejamento do projeto"
        value={field.value || ""}
        onChange={field.onChange}
      />
    )}
  />
);
