"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { Controller, Control, useWatch } from "react-hook-form";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { differenceInCalendarDays } from "date-fns";
import { Area } from "@/types/area.types";
import { OcorrenciaFormData } from "../helpers/validation";
import { AreaMultiSelect } from "./AreaMultiSelect";
import { ExcecoesHorarioForm } from "./ExcecoesHorarioForm";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  control: Control<OcorrenciaFormData>;
  areas: Area[];
  isSubmitting: boolean;
  erro?: string | null;
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}

export function OcorrenciaDrawer({ open, mode, control, areas, isSubmitting, erro, onClose, onSubmit, onDelete }: Props) {
  const de = useWatch({ control, name: "de" });
  const ate = useWatch({ control, name: "ate" });
  const mostrarExcecoes = de && ate && differenceInCalendarDays(ate, de) >= 1;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableEnforceFocus
      disableRestoreFocus
      PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, p: 0 } }}
    >
      <Box sx={{ px: 3, height: 61, display: "flex", flexShrink: "inherit", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={700}>
          {mode === "create" ? "Nova ocorrência" : "Editar ocorrência"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, overflowY: "auto", flexGrow: 1 }}>
        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erro}
          </Alert>
        )}

        <Stack gap={2.5}>
          <Controller
            control={control}
            name="titulo"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Título"
                fullWidth
                autoFocus
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
            <Controller
              control={control}
              name="de"
              render={({ field, fieldState }) => (
                <DateTimePicker
                  label="De"
                  value={field.value ?? null}
                  onChange={(valor) => valor && field.onChange(valor)}
                  ampm={false}
                  slotProps={{
                    textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="ate"
              render={({ field, fieldState }) => (
                <DateTimePicker
                  label="Até"
                  value={field.value ?? null}
                  onChange={(valor) => valor && field.onChange(valor)}
                  minDateTime={de}
                  ampm={false}
                  slotProps={{
                    textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                  }}
                />
              )}
            />
          </Stack>

          <Controller
            control={control}
            name="nota"
            render={({ field }) => (
              <TextField {...field} label="Nota" multiline rows={3} fullWidth placeholder="Opcional" />
            )}
          />

          <Controller
            control={control}
            name="areaIds"
            render={({ field }) => <AreaMultiSelect areas={areas} value={field.value} onChange={field.onChange} />}
          />

          {mostrarExcecoes && <ExcecoesHorarioForm control={control} de={de} ate={ate} />}
        </Stack>
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          {mode === "edit" && onDelete && (
            <Button onClick={onDelete} sx={{ color: "#d32f2f" }}>
              Excluir
            </Button>
          )}
        </Box>
        <Stack direction="row" gap={1}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={isSubmitting}
            sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Salvar"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
