"use client";

import { Box, Chip, CircularProgress, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { EventoDetalhes } from "@/types/evento.types";

interface Props {
  open: boolean;
  isLoading: boolean;
  isFetching: boolean;
  onClose: () => void;
  evento: EventoDetalhes | null;
}

function formatarPeriodo(dataInicio: string | null, dataFim: string | null): string {
  if (!dataInicio && !dataFim) return "-";

  const formatar = (valor: string) =>
    new Date(valor).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (dataInicio && dataFim) return `${formatar(dataInicio)} até ${formatar(dataFim)}`;
  return dataInicio ? formatar(dataInicio) : formatar(dataFim as string);
}

const STATUS_COR: Record<string, "success" | "warning" | "error" | "default"> = {
  aberto: "success",
  pausado: "warning",
  cancelado: "error",
  finalizado: "default",
};

function StatTile({ label, valor }: { label: string; valor: number | string }) {
  return (
    <Box sx={{ p: 1.5, bgcolor: "#FAFAFA", border: "1px solid #EEE", borderRadius: 1.5 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{valor}</Typography>
      <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>{label}</Typography>
    </Box>
  );
}

export function EventoVisualizacaoDrawer({ open, isLoading, isFetching, onClose, evento }: Props) {
  const carregando = isLoading || isFetching;
  const status = evento?.statusAtual ?? evento?.status ?? null;
  const vagasRestantes =
    evento?.limite_inscricoes != null ? Math.max(evento.limite_inscricoes - (evento.quantidadeParticipantes ?? 0), 0) : null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, p: 0 } }}>
      <Box sx={{ px: 3, height: 61, display: "flex", flexShrink: "inherit", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={700}>Detalhes do evento</Typography>
        <IconButton onClick={onClose} size="small">
          <Icon icon="mdi:close" width={24} />
        </IconButton>
      </Box>

      {carregando || !evento ? (
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ p: 3, overflowY: "auto", flexGrow: 1 }}>
            <Stack gap={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{evento.nome}</Typography>

              <Box>
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>Status</Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
                  <Chip label={(status?.nome || "aberto").toUpperCase()} color={STATUS_COR[status?.nome ?? "aberto"]} size="small" sx={{ fontWeight: 700 }} />
                  {status?.justificativa && (
                    <Typography variant="body2" sx={{ color: "#444" }}>{status.justificativa}</Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>Período</Typography>
                <Typography variant="body1">{formatarPeriodo(evento.data_inicio, evento.data_fim)}</Typography>
              </Box>

              {evento.data_maxima_inscricao && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>Inscrições até</Typography>
                  <Typography variant="body1">{formatarPeriodo(evento.data_maxima_inscricao, null)}</Typography>
                </Box>
              )}

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 1.5 }}>
                <StatTile label="Participantes inscritos" valor={evento.quantidadeParticipantes ?? 0} />
                {evento.limite_inscricoes != null && <StatTile label="Limite de inscrições" valor={evento.limite_inscricoes} />}
                {vagasRestantes != null && <StatTile label="Vagas restantes" valor={vagasRestantes} />}
                <StatTile label="Produtos" valor={evento.produtos?.length ?? 0} />
              </Box>

              {evento.descricao && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>Descrição</Typography>
                  <Box sx={{ "& p": { margin: 0 }, "& ul, & ol": { pl: 2 } }} dangerouslySetInnerHTML={{ __html: evento.descricao }} />
                </Box>
              )}

              {evento.produtos && evento.produtos.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, mb: 1, display: "block" }}>Produtos</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {evento.produtos.map((produto) => (
                      <Chip
                        key={produto.id}
                        label={produto.oculto ? `${produto.nome} (Oculto)` : produto.nome}
                        variant="outlined"
                        color={produto.oculto ? "default" : "primary"}
                        sx={{ fontWeight: 500, opacity: produto.oculto ? 0.6 : 1, textDecoration: produto.oculto ? "line-through" : "none" }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>

          <Box sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", justifyContent: "flex-end" }}>
            <Typography
              component={Link}
              href={`/eventos/${evento.id}`}
              variant="body2"
              sx={{ color: "#5B5FED", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              Ver evento completo →
            </Typography>
          </Box>
        </>
      )}
    </Drawer>
  );
}
