"use client";

import { Grid, TextField } from "@mui/material";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useCriarProjetoStyles } from "../styles";
import type { CriarProjetoSchema } from "../schemas/criar-projeto.schema";

interface Props {
  form: UseFormReturn<CriarProjetoSchema>;
}

export const StepInformacoes = ({ form }: Props) => {
  const styles = useCriarProjetoStyles();
  const {
    control,
    formState: { errors },
  } = form;

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

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="data_inicio"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Data de início"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={styles.input}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="data_fim"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Data de término"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={styles.input}
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
