"use client";

import {
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { getStatusInfo } from "@/config/helpers/projeto-status";
import type { StatusProjetoNome } from "@/types/projeto.types";
import { ORDEM_STATUS } from "../helpers/constants";
import { useProjetosStyles } from "../styles";

interface Props {
  selecionados: StatusProjetoNome[];
  onChange: (status: StatusProjetoNome[]) => void;
}

export const FiltroStatus = ({ selecionados, onChange }: Props) => {
  const styles = useProjetosStyles();

  const handleChange = (event: SelectChangeEvent<StatusProjetoNome[]>) => {
    const { value } = event.target;
    onChange(typeof value === "string" ? [] : value);
  };

  return (
    <FormControl size="small" sx={styles.filtroStatus}>
      <InputLabel id="filtro-status-label">Filtre por status</InputLabel>
      <Select
        multiple
        labelId="filtro-status-label"
        label="Filtre por status"
        value={selecionados}
        onChange={handleChange}
        renderValue={(valores) => {
          const [primeiro, ...restante] = valores;
          const info = getStatusInfo(primeiro);

          return (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Chip label={info.label} color={info.color} size="small" />
              {restante.length > 0 && (
                <Typography variant="caption" sx={{ fontWeight: 600 }} color="text.secondary">
                  +{restante.length}
                </Typography>
              )}
            </Stack>
          );
        }}
      >
        {ORDEM_STATUS.map((status) => (
          <MenuItem key={status} value={status} dense>
            <Checkbox size="small" checked={selecionados.includes(status)} />
            <ListItemText primary={getStatusInfo(status).label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
