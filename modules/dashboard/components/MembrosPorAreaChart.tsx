"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Skeleton, Typography } from "@mui/material";
import { DashboardStats } from "@/config/redux/api/dashboardApi";
import { CardWithTitle } from "@/components/card-with-title";

interface Props {
  data: DashboardStats["membrosPorArea"] | undefined;
  isLoading: boolean;
}

const COLORS = ["#7b57df", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function MembrosPorAreaChart({ data = [], isLoading }: Props) {
  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: "{b}: <b>{c}</b> ({d}%)",
      },
      legend: {
        bottom: 0,
        type: "scroll",
        textStyle: { color: "#555", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["45%", "70%"],
          center: ["50%", "45%"],
          data: data.map((d, i) => ({
            name: d.areaNome,
            value: d.total,
            itemStyle: { color: COLORS[i % COLORS.length] },
          })),
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 12, fontWeight: 600 },
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.2)" },
          },
        },
      ],
    }),
    [data]
  );

  return (
    <CardWithTitle title="Membros por área">
      {isLoading ? (
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1 }} />
      ) : data.length === 0 ? (
        <Typography color="text.secondary" variant="body2" mt={2}>
          Nenhuma área com membros.
        </Typography>
      ) : (
        <ReactECharts option={option} style={{ height: 220 }} opts={{ renderer: "svg" }} />
      )}
    </CardWithTitle>
  );
}
