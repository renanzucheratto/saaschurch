"use client";

import { useEffect, useMemo } from "react";
import {
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
} from "@mui/material";
import { useListarAreasQuery } from "@/config/redux/api/areasApi";
import { useAppSelector } from "@/config/redux/store";
import { selectCurrentUser } from "@/config/redux/slices/authSlice";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { AreaBullet } from "@/components/area-bullet";
import { AreaChip } from "@/components/area-chip";

interface Props {
  value: string[];
  onChange: (areaIds: string[]) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

/**
 * Seleção das áreas envolvidas no projeto. As áreas que o usuário lidera entram
 * sempre e não podem ser removidas; o backoffice escolhe livremente.
 */
export const SelectAreas = ({ value, onChange, error, helperText, disabled }: Props) => {
  const { data: areas = [], isLoading } = useListarAreasQuery();
  const currentUser = useAppSelector(selectCurrentUser);
  const { is } = usePermissions();

  const idsTravados = useMemo(() => {
    if (is("backoffice")) return [];
    return areas
      .filter((area) => area.lideres.some((lider) => lider.id === currentUser?.id))
      .map((area) => area.id);
  }, [areas, currentUser?.id, is]);

  // Garante que as áreas lideradas estejam sempre no valor enviado ao backend.
  useEffect(() => {
    const faltando = idsTravados.filter((id) => !value.includes(id));
    if (faltando.length > 0) onChange([...value, ...faltando]);
  }, [idsTravados, value, onChange]);

  const selecionadas = useMemo(
    () => areas.filter((area) => value.includes(area.id)),
    [areas, value],
  );

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const { value: novo } = event.target;
    const ids = typeof novo === "string" ? novo.split(",") : novo;
    // Reinsere o que estiver travado, caso o clique tenha desmarcado.
    onChange(Array.from(new Set([...idsTravados, ...ids])));
  };

  return (
    <FormControl fullWidth error={error} disabled={disabled || isLoading}>
      <InputLabel id="select-areas-label">Áreas envolvidas *</InputLabel>
      <Select
        multiple
        labelId="select-areas-label"
        label="Áreas envolvidas *"
        value={value}
        onChange={handleChange}
        sx={{ borderRadius: 1.5 }}
        renderValue={() => (
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {selecionadas.map((area) => (
              <AreaChip key={area.id} area={area} />
            ))}
          </Stack>
        )}
      >
        {areas.map((area) => {
          const travada = idsTravados.includes(area.id);

          return (
            <MenuItem key={area.id} value={area.id} disabled={travada} dense>
              <Checkbox size="small" checked={value.includes(area.id)} />
              <AreaBullet cor={area.cor} sx={{ mr: 1 }} />
              <ListItemText
                primary={area.nome}
                secondary={travada ? "Sua área — sempre incluída" : undefined}
              />
            </MenuItem>
          );
        })}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
