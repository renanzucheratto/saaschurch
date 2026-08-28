"use client";

import { Box, Tooltip, Typography } from "@mui/material";
import { useCalendarioStyles } from "../styles";
import { ItemCalendario } from "../helpers/calendario-item.types";

interface Props {
  item: ItemCalendario;
}

export function OcorrenciaBloco({ item }: Props) {
  const styles = useCalendarioStyles();

  return (
    <Tooltip title={item.resource.nota ? `${item.title} — ${item.resource.nota}` : item.title}>
      <Box
        sx={{
          ...styles.ocorrenciaBloco,
          bgcolor: item.resource.corPrincipal,
          color: "#fff",
          borderRadius: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: "inherit", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.title}
        </Typography>
        {item.resource.corsExtras.map((cor, index) => (
          <Box key={index} sx={{ ...styles.dotExtra, bgcolor: cor }} />
        ))}
      </Box>
    </Tooltip>
  );
}
