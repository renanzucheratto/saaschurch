"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { Box, Skeleton } from "@mui/material";
import { DashboardStats } from "@/config/redux/api/dashboardApi";
import { CardWithTitle } from "@/components/card-with-title";

interface Props {
  data: DashboardStats["eventosPorMes"] | undefined;
  isLoading: boolean;
}

export function EventosPorMesChart({ data = [], isLoading }: Props) {
  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        formatter: (params: any[]) => `${params[0].axisValue}: <b>${params[0].value}</b> eventos`,
      },
      grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
      xAxis: {
        type: "category",
        data: data.map((d) => d.mes),
        axisLine: { lineStyle: { color: "#E0E0E0" } },
        axisTick: { show: false },
        axisLabel: { color: "#888", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#888", fontSize: 11 },
        splitLine: { lineStyle: { color: "#F0F0F0" } },
      },
      series: [
        {
          type: "line",
          data: data.map((d) => d.total),
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2, color: "#3b82f6" },
          itemStyle: { color: "#3b82f6", borderWidth: 2, borderColor: "#fff" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(59,130,246,0.35)" },
              { offset: 1, color: "rgba(59,130,246,0)" },
            ]),
          },
        },
      ],
    }),
    [data]
  );

  return (
    <CardWithTitle title="Eventos por mês">
      {isLoading ? (
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1 }} />
      ) : (
        <Box sx={{mt: 3}}>
          <ReactECharts option={option} style={{ height: 220 }} opts={{ renderer: "svg" }} />
        </Box>
      )}
    </CardWithTitle>
  );
}
