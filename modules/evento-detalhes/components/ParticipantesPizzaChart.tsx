"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Box, Typography, Card, CircularProgress } from "@mui/material";
import { useObterEstatisticasPizzaQuery } from "@/config/redux/api/eventosApi";

interface ParticipantesPizzaChartProps {
  eventoId: string;
}

export default function ParticipantesPizzaChart({ eventoId }: ParticipantesPizzaChartProps) {
  const { data: estatisticas = [], isLoading } = useObterEstatisticasPizzaQuery(eventoId);

  const chartOptions = useMemo(() => {
    const pieData = estatisticas.map(e => ({
      name: e.label,
      value: e.value
    }));

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}"
      },
      legend: {
        top: "0",
      },
      series: [
        {
          name: "Participantes",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "55%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 5,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}\n{c}",
            fontSize: 12,
            fontWeight: 600,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 12,
            smooth: true,
          },
          data: pieData,
        },
      ],
      color: ["#3db0a5ff", "#fba505ff"],
    };
  }, [estatisticas]);

  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", minHeight: 500 }}>
        <CircularProgress />
      </Card>
    );
  }

  if (!estatisticas || estatisticas.length === 0) {
    return (
      <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
        <Typography variant="body1" color="text.secondary">
          Nenhum dado disponível para exibir
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Day Use vs Retiro (Inclui Pacotes)
      </Typography>
      <Box sx={{ width: "100%", minHeight: 250, height: '100%', display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ReactECharts
          option={chartOptions}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </Box>
    </Card>
  );
}
