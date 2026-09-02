"use client";

import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import type { UseFormReturn } from "react-hook-form";
import { formatCurrencyToNumber, formatNumberToCurrency } from "@/config/helpers/currency-mask";
import { formatDate } from "@/config/helpers/format-date";
import { useCriarProjetoStyles } from "../styles";
import type { CriarProjetoSchema } from "../schemas/criar-projeto.schema";

interface Props {
  form: UseFormReturn<CriarProjetoSchema>;
  total: number;
  onEditarEtapa: (indice: number) => void;
}

interface LinhaProps {
  label: string;
  valor: string;
}

const Linha = ({ label, valor }: LinhaProps) => {
  const styles = useCriarProjetoStyles();

  return (
    <Stack direction="row" justifyContent="space-between" gap={2} sx={styles.revisaoLinha}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
        {valor}
      </Typography>
    </Stack>
  );
};

export const StepRevisao = ({ form, total, onEditarEtapa }: Props) => {
  const styles = useCriarProjetoStyles();
  const valores = form.watch();

  const botaoEditar = (indice: number) => (
    <Button
      size="small"
      startIcon={<IconifyIcon icon="material-symbols:edit-outline" width={16} />}
      onClick={() => onEditarEtapa(indice)}
      sx={{ textTransform: "none", fontWeight: 600 }}
    >
      Editar
    </Button>
  );

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={styles.alertCompacto}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Ao criar, o projeto entra em &quot;Em análise&quot;
        </Typography>
        <Typography variant="caption" color="text.secondary">
          A liderança avalia o orçamento. Enquanto estiver em análise você ainda pode editar o
          projeto.
        </Typography>
      </Alert>

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Informações
          </Typography>
          {botaoEditar(0)}
        </Stack>
        <Linha label="Nome" valor={valores.nome || "-"} />
        <Linha label="Início" valor={formatDate(valores.data_inicio || null)} />
        <Linha label="Término" valor={formatDate(valores.data_fim || null)} />
        <Linha label="Descrição" valor={valores.descricao || "-"} />
      </Box>

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Detalhamento
          </Typography>
          {botaoEditar(1)}
        </Stack>
        {valores.ideias ? (
          <Box
            sx={{ "& p": { m: 0 }, fontSize: 14, color: "text.primary", mt: 1 }}
            dangerouslySetInnerHTML={{ __html: valores.ideias }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nenhum detalhamento informado.
          </Typography>
        )}
      </Box>

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Orçamento
          </Typography>
          {botaoEditar(2)}
        </Stack>
        {(valores.itens || []).map((item, index) => (
          <Linha
            key={`${item.nome}-${index}`}
            label={`${item.quantidade || 0}x ${item.nome || `Item ${index + 1}`}`}
            valor={formatNumberToCurrency(
              (Number(item.quantidade) || 0) * formatCurrencyToNumber(item.valor_unit || ""),
            )}
          />
        ))}
        <Stack direction="row" justifyContent="space-between" sx={{ pt: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Total planejado
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {formatNumberToCurrency(total)}
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
};
