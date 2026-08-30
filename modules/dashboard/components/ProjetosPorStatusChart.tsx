"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Skeleton, Typography } from "@mui/material";
import { DashboardStats } from "@/config/redux/api/dashboardApi";
import { CardWithTitle } from "@/components/card-with-title";

interface Props {
  data: DashboardStats["projetosPorStatus"] | undefined;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  em_analise: "#f59e0b",
  aprovado: "#10b981",
  recusado: "#ef4444",
  em_reembolso: "#3b82f6",
  liquidado: "#8b5cf6",
  finalizado: "#6b7280",
  "Sem status": "#d1d5db",
};

const STATUS_LABEL: Record<string, string> = {
  em_analise: "Em análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
  em_reembolso: "Em reembolso",
  liquidado: "Liquidado",
  finalizado: "Finalizado",
  "Sem status": "Sem status",
};

export function ProjetosPorStatusChart({ data = [], isLoading }: Props) {
  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "none" },
        formatter: (params: any[]) => `${params[0].name}: <b>${params[0].value}</b> projetos`,
      },
      grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#888", fontSize: 11 },
        splitLine: { lineStyle: { color: "#F0F0F0" } },
      },
      yAxis: {
        type: "category",
        data: data.map((d) => STATUS_LABEL[d.status] ?? d.status),
        axisLabel: { color: "#555", fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: data.map((d) => ({
            value: d.total,
            itemStyle: { color: STATUS_COLORS[d.status] ?? "#7b57df", borderRadius: [0, 4, 4, 0] },
          })),
          barMaxWidth: 32,
          label: { show: true, position: "right", color: "#555", fontSize: 11, fontWeight: 600 },
        },
      ],
    }),
    [data]
  );

  return (
    <CardWithTitle title="Projetos por status">
      {isLoading ? (
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
      ) : data.length === 0 ? (
        <Typography color="text.secondary" variant="body2" mt={2}>
          Nenhum projeto cadastrado.
        </Typography>
      ) : (
        <ReactECharts option={option} style={{ height: 200 }} opts={{ renderer: "svg" }} />
      )}
    </CardWithTitle>
  );
}
