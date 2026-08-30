"use client";

import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { format } from "date-fns";
import { useCalendarioStyles } from "../styles";
import { ItemCalendario } from "../helpers/calendario-item.types";

interface Props {
  item: ItemCalendario;
}

export function OcorrenciaBloco({ item }: Props) {
  const styles = useCalendarioStyles();
  const cor = item.resource.corPrincipal;

  return (
    <Box
      sx={{
        ...styles.itemBloco,
        bgcolor: alpha(cor, 0.16),
        borderLeftColor: cor,
        color: cor,
      }}
    >
      <Typography variant="caption" sx={{ ...styles.horaTexto, color: "inherit" }}>
        {format(item.start, "HH:mm")}
      </Typography>
      <Typography variant="caption" sx={{ ...styles.tituloTexto, color: "inherit" }}>
        {item.title}
      </Typography>
      {item.resource.corsExtras.map((corExtra, index) => (
        <Box key={index} sx={{ ...styles.dotExtra, bgcolor: corExtra }} />
      ))}
    </Box>
  );
}
