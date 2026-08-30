"use client";

import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useCalendarioStyles } from "../styles";
import { ItemCalendario } from "../helpers/calendario-item.types";

interface Props {
  item: ItemCalendario;
}

export function FeriadoBloco({ item }: Props) {
  const styles = useCalendarioStyles();
  const cor = item.resource.corPrincipal;

  return (
    <Box
      sx={{
        ...styles.itemBloco,
        bgcolor: alpha(cor, 0.12),
        borderLeftColor: cor,
        color: cor,
        cursor: "default",
      }}
    >
      <Typography variant="caption" sx={{ ...styles.tituloTexto, color: "inherit" }}>
        {item.title}
      </Typography>
    </Box>
  );
}
