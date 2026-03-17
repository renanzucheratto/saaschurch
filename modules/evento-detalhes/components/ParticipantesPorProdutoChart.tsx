"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Box, Typography, Paper, CircularProgress, Card } from "@mui/material";
import { useObterEstatisticasParticipantesPorProdutoQuery } from "@/config/redux/api/eventosApi";

interface ParticipantesPorProdutoChartProps {
  eventoId: string;
}

export default function ParticipantesPorProdutoChart({ eventoId }: ParticipantesPorProdutoChartProps) {
  const { data: estatisticas = [], isLoading } = useObterEstatisticasParticipantesPorProdutoQuery(eventoId);

  const chartOptions = useMemo(() => {
    const legendData = estatisticas.map(e => e.produtoNome);
    const seriesData = estatisticas.map((e) => ({
      name: e.produtoNome,
      type: "bar",
      barMaxWidth: 50,
      barGap: "20%", // Adiciona um pequeno espaço entre as barras
      itemStyle: {
        color: "#7b57df",
        borderRadius: [4, 4, 0, 0],
      },
      data: [e.quantidadeParticipantes], // Cada série tem apenas um ponto na categoria única
      label: {
        show: true,
        position: "top",
        color: "#1A1A1A",
        fontSize: 12,
        fontWeight: 600,
      },
    }));

    return {
      tooltip: {
        trigger: "item",
      },
      legend: {
        bottom: 0,
        type: "plain",
        padding: [20, 0, 0, 0],
        data: legendData,
      },
      grid: {
        left: "10px",
        right: "10px",
        bottom: "100px",
        top: "30px",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: ["Participantes"], // Categoria única para agrupar todas as séries no centro
        axisLabel: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: "value",
        name: "Quantidade",
        nameTextStyle: {
          color: "#666",
          fontSize: 12,
        },
        axisLabel: {
          color: "#666",
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: "#E0E0E0",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#F0F0F0",
          },
        },
      },
      series: seriesData,
    };
  }, [estatisticas]);

  if (isLoading) {
    return (
      <Card variant="outlined">
        <CircularProgress />
      </Card>
    );
  }

  if (!estatisticas || estatisticas.length === 0) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Participantes por produto
      </Typography>
      <Box sx={{ width: "100%", minHeight: 400, height: '100%' }}>
        <ReactECharts
          option={chartOptions}
          style={{ height: "400px", width: "100%" }}
          opts={{ renderer: "svg" }}
        />

      </Box>
    </Card>
  );
}
