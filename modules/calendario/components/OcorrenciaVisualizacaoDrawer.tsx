"use client";

import { Box, Button, Chip, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { COR_FALLBACK_AREA } from "../helpers/constants";
import { OcorrenciaCalendario } from "@/types/ocorrencia-calendario.types";

interface Props {
  open: boolean;
  ocorrencia: OcorrenciaCalendario | null;
  podeEditar: boolean;
  onClose: () => void;
  onEditar: (ocorrenciaId: string) => void;
}

function formatarData(valor: string): string {
  return new Date(valor).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatarPeriodo(ocorrencia: OcorrenciaCalendario): string {
  const inicio = formatarData(ocorrencia.dataInicio);
  const fim = formatarData(ocorrencia.dataFim);
  const periodo = inicio === fim ? inicio : `${inicio} até ${fim}`;
  return `${periodo} — ${ocorrencia.horaInicioDefault} às ${ocorrencia.horaFimDefault}`;
}

export function OcorrenciaVisualizacaoDrawer({ open, ocorrencia, podeEditar, onClose, onEditar }: Props) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, p: 0 } }}>
      <Box sx={{ px: 3, height: 61, display: "flex", flexShrink: "inherit", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={700}>Detalhes da ocorrência</Typography>
        <IconButton onClick={onClose} size="small">
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      {ocorrencia && (
        <>
          <Box sx={{ p: 3, overflowY: "auto", flexGrow: 1 }}>
            <Stack gap={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{ocorrencia.titulo}</Typography>

              <Box>
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>Período</Typography>
                <Typography variant="body1">{formatarPeriodo(ocorrencia)}</Typography>
              </Box>

              {ocorrencia.nota && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>Nota</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>{ocorrencia.nota}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, mb: 1, display: "block" }}>Áreas responsáveis</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {ocorrencia.areas.map((area) => (
                    <Chip
                      key={area.id}
                      label={area.nome}
                      size="small"
                      icon={<Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: area.cor ?? COR_FALLBACK_AREA }} />}
                      sx={{ "& .MuiChip-icon": { ml: 1.25, mr: 0.5 } }}
                    />
                  ))}
                </Box>
              </Box>

              {ocorrencia.excecoes.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, mb: 1, display: "block" }}>Horários específicos</Typography>
                  <Stack gap={0.75}>
                    {ocorrencia.excecoes.map((excecao, index) => (
                      <Typography key={excecao.id ?? index} variant="body2">
                        {formatarData(excecao.data)} — {excecao.horaInicio} às {excecao.horaFim}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {podeEditar && (
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<Icon icon="material-symbols:edit-outline" width={18} />}
                onClick={() => onEditar(ocorrencia.id)}
                sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
              >
                Editar ocorrência
              </Button>
            </Box>
          )}
        </>
      )}
    </Drawer>
  );
}
