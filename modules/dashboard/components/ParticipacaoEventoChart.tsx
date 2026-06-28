"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { DashboardStats } from "@/config/redux/api/dashboardApi";

interface Props {
  data: DashboardStats["participacaoPorEvento"] | undefined;
  isLoading: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; border: string; label: string }> = {
  aberto:    { bg: "#6ee7b7", border: "#34d399", label: "Aberto"    },
  pausado:   { bg: "#fcd34d", border: "#fbbf24", label: "Pausado"   },
  cancelado: { bg: "#fca5a5", border: "#f87171", label: "Cancelado" },
  finalizado:{ bg: "#d1d5db", border: "#c6cad0", label: "Finalizado"},
};

function statusConfig(status: string) {
  return STATUS_CONFIG[status] ?? { bg: "#c4b5fd", border: "#a78bfa", label: status };
}

function truncate(str: string, max = 16) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export function ParticipacaoEventoChart({ data = [], isLoading }: Props) {
  const legendStatuses = useMemo(() => {
    const seen = new Set<string>();
    data.forEach((d) => seen.add(d.status));
    return Array.from(seen);
  }, [data]);

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "none" },
        formatter: (params: any[]) => {
          const d = data[params[0].dataIndex];
          return `<b>${d.eventoNome}</b><br/>${params[0].value} participantes`;
        },
      },
      grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
      xAxis: {
        type: "category",
        data: data.map((d) => truncate(d.eventoNome)),
        axisLabel: { color: "#555", fontSize: 11, interval: 0, rotate: data.length > 5 ? 30 : 0 },
        axisLine: { lineStyle: { color: "#E0E0E0" } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#888", fontSize: 11 },
        splitLine: { lineStyle: { color: "#F0F0F0" } },
      },
      series: [
        {
          type: "bar",
          data: data.map((d) => {
            const cfg = statusConfig(d.status);
            return {
              value: d.total,
              itemStyle: {
                color: cfg.bg,
                borderColor: cfg.border,
                borderWidth: 1.5,
                borderRadius: [4, 4, 0, 0],
              },
            };
          }),
          barMaxWidth: 48,
          label: {
            show: true,
            position: "top",
            color: "#555",
            fontSize: 11,
            fontWeight: 600,
          },
        },
      ],
    }),
    [data]
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
      <CardContent sx={{ p: 0, pb: '0!important' }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Participação por evento
        </Typography>

        {isLoading ? (
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1 }} />
        ) : data.length === 0 ? (
          <Typography color="text.secondary" variant="body2" mt={2}>
            Nenhum evento cadastrado.
          </Typography>
        ) : (
          <>
            <ReactECharts
              option={option}
              style={{ height: 240 }}
              opts={{ renderer: "svg" }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: "wrap",
                gap: 1.5,
                mt: 2,
                px: 0.5,
              }}
            >
              {legendStatuses.map((s) => {
                const cfg = statusConfig(s);
                return (
                  <Box
                    key={s}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: 0.5,
                        bgcolor: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {cfg.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
