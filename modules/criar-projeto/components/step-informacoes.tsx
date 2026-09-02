"use client";

import { Grid, TextField } from "@mui/material";
import { Controller, type UseFormReturn } from "react-hook-form";
import { parseDateInput, resolveEndDate } from "@/config/helpers/format-date";
import { DatePickerField } from "@/components/date-picker-field";
import { SelectAreas } from "@/components/select-areas";
import { useCriarProjetoStyles } from "../styles";
import type { CriarProjetoSchema } from "../schemas/criar-projeto.schema";

interface Props {
  form: UseFormReturn<CriarProjetoSchema>;
}

export const StepInformacoes = ({ form }: Props) => {
  const styles = useCriarProjetoStyles();
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  // O término nunca pode cair antes do início escolhido.
  const dataInicio = watch("data_inicio");
  const dataFim = watch("data_fim");

  const handleInicioChange = (valor: string, onChange: (valor: string) => void) => {
    onChange(valor);
    // Um início posterior invalida o término já preenchido, então ele é limpo.
    setValue("data_fim", resolveEndDate(valor, dataFim), { shouldValidate: true });
  };

  return (
    <Grid container spacing={2.5}>
      <Grid size={12}>
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nome do projeto *"
              placeholder="Ex.: Reforma da sala de crianças"
              fullWidth
              error={!!errors.nome}
              helperText={errors.nome?.message}
              sx={styles.input}
            />
          )}
        />
      </Grid>

      <Grid size={12}>
        <Controller
          name="areaIds"
          control={control}
          render={({ field }) => (
            <SelectAreas
              value={field.value || []}
              onChange={field.onChange}
              error={!!errors.areaIds}
              helperText={errors.areaIds?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="data_inicio"
          control={control}
          render={({ field }) => (
            <DatePickerField
              label="Data de início *"
              value={field.value || ""}
              onChange={(valor) => handleInicioChange(valor, field.onChange)}
              error={!!errors.data_inicio}
              helperText={errors.data_inicio?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="data_fim"
          control={control}
          render={({ field }) => (
            <DatePickerField
              label="Data de término"
              value={field.value || ""}
              onChange={field.onChange}
              minDate={parseDateInput(dataInicio)}
              error={!!errors.data_fim}
              helperText={errors.data_fim?.message}
            />
          )}
        />
      </Grid>

      <Grid size={12}>
        <Controller
          name="descricao"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Descrição"
              placeholder="Resuma em uma ou duas frases o que será feito"
              fullWidth
              multiline
              minRows={3}
              sx={styles.input}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};
