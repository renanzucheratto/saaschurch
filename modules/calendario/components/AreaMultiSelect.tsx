"use client";

import { Autocomplete, Box, Chip, TextField } from "@mui/material";
import { Area } from "@/types/area.types";
import { COR_FALLBACK_AREA } from "../helpers/constants";

interface Props {
  areas: Area[];
  value: string[];
  onChange: (areaIds: string[]) => void;
}

function Swatch({ cor }: { cor: string | null }) {
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: cor ?? COR_FALLBACK_AREA,
        flexShrink: 0,
      }}
    />
  );
}

export function AreaMultiSelect({ areas, value, onChange }: Props) {
  const selecionadas = areas.filter((area) => value.includes(area.id));

  return (
    <Autocomplete
      multiple
      options={areas}
      value={selecionadas}
      onChange={(_, novasAreas) => onChange(novasAreas.map((area) => area.id))}
      getOptionLabel={(area) => area.nome}
      isOptionEqualToValue={(area, valor) => area.id === valor.id}
      renderOption={(props, area) => (
        <Box component="li" {...props} key={area.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Swatch cor={area.cor} />
          {area.nome}
        </Box>
      )}
      renderTags={(selecionadas, getTagProps) =>
        selecionadas.map((area, index) => (
          <Chip
            {...getTagProps({ index })}
            key={area.id}
            label={area.nome}
            size="small"
            icon={<Swatch cor={area.cor} />}
            sx={{ "& .MuiChip-icon": { ml: 1.25, mr: 0.5 } }}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} label="Áreas responsáveis" placeholder="Selecionar áreas" />}
    />
  );
}
