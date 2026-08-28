"use client";

import { Box, Tooltip, Typography } from "@mui/material";
import { useCalendarioStyles } from "../styles";
import { ItemCalendario } from "../helpers/calendario-item.types";

interface Props {
  item: ItemCalendario;
}

export function EventoBloco({ item }: Props) {
  const styles = useCalendarioStyles();

  return (
    <Tooltip title={`${item.title} (evento — somente leitura)`}>
      <Box
        sx={{
          ...styles.eventoBloco,
          bgcolor: item.resource.corPrincipal,
          color: "#fff",
          borderRadius: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: "inherit", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.title}
        </Typography>
      </Box>
    </Tooltip>
  );
}
