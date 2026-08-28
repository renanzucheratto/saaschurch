"use client";

import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { Controller, Control, useFieldArray } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { OcorrenciaFormData } from "../helpers/validation";

interface Props {
  control: Control<OcorrenciaFormData>;
  de: Date;
  ate: Date;
}

export function ExcecoesHorarioForm({ control, de, ate }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "excecoes" });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2">Horários por dia (exceções)</Typography>
        <Button
          size="small"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => append({ data: de, horaInicio: "09:00", horaFim: "10:00" })}
        >
          Adicionar exceção
        </Button>
      </Stack>

      {fields.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          Todos os dias usarão o horário padrão. Adicione uma exceção para um dia com horário diferente.
        </Typography>
      )}

      <Stack gap={1.5} mt={fields.length > 0 ? 1 : 0}>
        {fields.map((field, index) => (
          <Stack key={field.id} direction="row" gap={1} alignItems="center">
            <Controller
              control={control}
              name={`excecoes.${index}.data`}
              render={({ field: dataField, fieldState }) => (
                <DatePicker
                  label="Data"
                  value={dataField.value ?? null}
                  onChange={(novaData) => novaData && dataField.onChange(novaData)}
                  minDate={de}
                  maxDate={ate}
                  slotProps={{
                    textField: {
                      size: "small",
                      error: !!fieldState.error,
                      sx: { width: 160 },
                    },
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name={`excecoes.${index}.horaInicio`}
              render={({ field: horaField, fieldState }) => (
                <TextField
                  {...horaField}
                  type="time"
                  size="small"
                  label="Início"
                  error={!!fieldState.error}
                  sx={{ width: 120 }}
                />
              )}
            />
            <Controller
              control={control}
              name={`excecoes.${index}.horaFim`}
              render={({ field: horaField, fieldState }) => (
                <TextField
                  {...horaField}
                  type="time"
                  size="small"
                  label="Fim"
                  error={!!fieldState.error}
                  sx={{ width: 120 }}
                />
              )}
            />
            <IconButton size="small" onClick={() => remove(index)} sx={{ color: "#d32f2f" }}>
              <Icon icon="material-symbols:delete-outline" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
