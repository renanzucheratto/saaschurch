"use client";

import { Button, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { View } from "react-big-calendar";
import { CalendarioView } from "../helpers/constants";

interface Props {
  view: CalendarioView;
  date: Date;
  podeGerenciar: boolean;
  onViewChange: (view: View) => void;
  onNavigate: (date: Date) => void;
  onNovaOcorrencia: () => void;
}

export function CalendarioHeader({ view, date, podeGerenciar, onViewChange, onNavigate, onNovaOcorrencia }: Props) {
  const label = format(date, "MMMM yyyy", { locale: ptBR });

  return (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
      <Stack direction="row" alignItems="center" gap={1}>
        <IconButton size="small" onClick={() => onNavigate(new Date())}>
          <Icon icon="material-symbols:today-outline" width={20} />
        </IconButton>
        <IconButton size="small" onClick={() => onNavigate(navegar(date, view, -1))}>
          <Icon icon="material-symbols:chevron-left" width={22} />
        </IconButton>
        <IconButton size="small" onClick={() => onNavigate(navegar(date, view, 1))}>
          <Icon icon="material-symbols:chevron-right" width={22} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, textTransform: "capitalize", ml: 1 }}>
          {label}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" gap={2}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, novaView) => novaView && onViewChange(novaView)}
        >
          <ToggleButton value="month">Mês</ToggleButton>
          <ToggleButton value="week">Semana</ToggleButton>
        </ToggleButtonGroup>

        {podeGerenciar && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Icon icon="material-symbols:add" />}
            onClick={onNovaOcorrencia}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            Nova ocorrência
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

function navegar(date: Date, view: CalendarioView, direcao: 1 | -1): Date {
  const nova = new Date(date);
  if (view === "month") {
    nova.setMonth(nova.getMonth() + direcao);
  } else {
    nova.setDate(nova.getDate() + direcao * 7);
  }
  return nova;
}
