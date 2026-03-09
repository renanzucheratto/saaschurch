"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { useObterEstatisticasParticipantesPorProdutoQuery } from "@/config/redux/api/eventosApi";

interface ParticipantesPorProdutoChartProps {
  eventoId: string;
}

export default function ParticipantesPorProdutoChart({ eventoId }: ParticipantesPorProdutoChartProps) {
  const { data: estatisticas = [], isLoading } = useObterEstatisticasParticipantesPorProdutoQuery(eventoId);

  const chartOptions = useMemo(() => {
    const produtoNomes = estatisticas.map(e => e.produtoNome);
    const quantidades = estatisticas.map(e => e.quantidadeParticipantes);

    return {
      title: {
        text: "Participantes por Produto",
        left: "center",
        textStyle: {
          fontSize: 18,
          fontWeight: 600,
          color: "#1A1A1A",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: Array<{ name: string; marker: string; seriesName: string; value: number }>) => {
          const data = params[0];
          return `${data.name}<br/>${data.marker}${data.seriesName}: ${data.value}`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: produtoNomes,
        axisLabel: {
          interval: 0,
          rotate: produtoNomes.length > 5 ? 45 : 0,
          fontSize: 12,
          color: "#666",
        },
        axisLine: {
          lineStyle: {
            color: "#E0E0E0",
          },
        },
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
      series: [
        {
          name: "Participantes",
          type: "bar",
          data: quantidades,
          itemStyle: {
            color: "#1976d2",
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: "#1565c0",
            },
          },
          label: {
            show: true,
            position: "top",
            color: "#1A1A1A",
            fontSize: 12,
            fontWeight: 600,
          },
        },
      ],
    };
  }, [estatisticas]);

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid #E0E0E0",
          borderRadius: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 600,
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  if (!estatisticas || estatisticas.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid #E0E0E0",
          borderRadius: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 600,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Nenhum dado disponível para exibir
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid #E0E0E0",
        borderRadius: 2,
      }}
    >
      <Box sx={{ width: "100%", height: 600 }}>
        <ReactECharts
          option={chartOptions}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </Box>
    </Paper>
  );
}
