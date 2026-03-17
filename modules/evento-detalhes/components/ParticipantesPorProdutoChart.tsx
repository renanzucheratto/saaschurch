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
    const produtoNomes = estatisticas.map(e => e.produtoNome);
    const quantidades = estatisticas.map(e => e.quantidadeParticipantes);

    return {
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
        left: "10px",
        right: "10px",
        bottom: "0px",
        top: "30px",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: produtoNomes,
        axisLabel: {
          interval: 0,
          rotate: produtoNomes.length > 5 ? 70 : 0,
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
          barWidth: 50,
          itemStyle: {
            color: "#7b57df",
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: "#5b3fbd",
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
      <Card variant="outlined">
        <CircularProgress />
      </Card>
    );
  }

  if (!estatisticas || estatisticas.length === 0) {
    return (
      <Card variant="outlined">
        <Typography variant="body1" color="text.secondary">
          Nenhum dado disponível para exibir
        </Typography>

        <Typography variant="body1" color="text.secondary">
          Nenhum dado disponível para exibir
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Participantes por produto
      </Typography>
      <Box sx={{ width: "100%", height: 550 }}>
        <ReactECharts
          option={chartOptions}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "svg" }}
        />

      </Box>
    </Card>
  );
}
