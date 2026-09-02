"use client";

import { Alert, Button, Stack, Typography } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import { AVISO_ORCAMENTO, ITEM_PROJETO_VAZIO } from "../helpers/constants";
import { useCriarProjetoStyles } from "../styles";
import { ItemProjetoCard } from "./item-projeto-card";
import type { CriarProjetoSchema } from "../schemas/criar-projeto.schema";

interface Props {
  form: UseFormReturn<CriarProjetoSchema>;
  itensArray: UseFieldArrayReturn<CriarProjetoSchema, "itens">;
  total: number;
}

export const StepOrcamento = ({ form, itensArray, total }: Props) => {
  const styles = useCriarProjetoStyles();
  const { fields, append, remove } = itensArray;
  const erroItens = form.formState.errors.itens?.message;

  return (
    <Stack spacing={2}>
      <Alert
        severity="warning"
        icon={<IconifyIcon icon="material-symbols:info-outline" width={20} />}
        sx={{ borderRadius: 1.5 }}
      >
        <Typography variant="caption">{AVISO_ORCAMENTO}</Typography>
      </Alert>

      {erroItens && (
        <Typography color="error" variant="caption">
          {erroItens}
        </Typography>
      )}

      {fields.map((field, index) => (
        <ItemProjetoCard
          key={field.id}
          form={form}
          index={index}
          podeRemover={fields.length > 1}
          onRemover={() => remove(index)}
        />
      ))}

      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Button
          variant="outlined"
          startIcon={<IconifyIcon icon="material-symbols:add" width={18} />}
          onClick={() => append({ ...ITEM_PROJETO_VAZIO })}
          sx={styles.acaoButton}
        >
          Adicionar item
        </Button>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Total planejado: {formatNumberToCurrency(total)}
        </Typography>
      </Stack>
    </Stack>
  );
};
