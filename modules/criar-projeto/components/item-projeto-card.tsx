"use client";

import { Card, Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { CurrencyMaskCustom, formatNumberToCurrency, formatCurrencyToNumber } from "@/config/helpers/currency-mask";
import { useCriarProjetoStyles } from "../styles";
import type { CriarProjetoSchema } from "../schemas/criar-projeto.schema";

interface Props {
  form: UseFormReturn<CriarProjetoSchema>;
  index: number;
  podeRemover: boolean;
  onRemover: () => void;
}

export const ItemProjetoCard = ({ form, index, podeRemover, onRemover }: Props) => {
  const styles = useCriarProjetoStyles();
  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const item = watch(`itens.${index}`);
  const subtotal = (Number(item?.quantidade) || 0) * formatCurrencyToNumber(item?.valor_unit || "");

  return (
    <Card variant="outlined" sx={styles.itemCard}>
      {podeRemover && (
        <IconButton size="small" onClick={onRemover} sx={styles.removerItem}>
          <IconifyIcon icon="material-symbols:close" width={18} />
        </IconButton>
      )}

      <Stack direction="row" alignItems="baseline" gap={1} sx={{ mb: 1.5, pr: 4 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
          Item {index + 1}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, ml: "auto" }}>
          Subtotal: {formatNumberToCurrency(subtotal)}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={`itens.${index}.nome`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nome do item *"
                size="small"
                fullWidth
                error={!!errors.itens?.[index]?.nome}
                helperText={errors.itens?.[index]?.nome?.message}
                sx={styles.input}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Controller
            name={`itens.${index}.quantidade`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Quantidade *"
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 1 }}
                error={!!errors.itens?.[index]?.quantidade}
                helperText={errors.itens?.[index]?.quantidade?.message}
                sx={styles.input}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Controller
            name={`itens.${index}.valor_unit`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Valor unitário *"
                size="small"
                fullWidth
                placeholder="R$ 0,00"
                error={!!errors.itens?.[index]?.valor_unit}
                helperText={errors.itens?.[index]?.valor_unit?.message}
                slotProps={{ inputLabel: { shrink: true } }}
                InputProps={{ inputComponent: CurrencyMaskCustom as never }}
                sx={styles.input}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
          <Controller
            name={`itens.${index}.descricao`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descrição (opcional)"
                size="small"
                fullWidth
                sx={styles.input}
              />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
};
