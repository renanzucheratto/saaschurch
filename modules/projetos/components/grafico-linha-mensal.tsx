"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import type { PontoMensal } from "../types";

interface Props {
  pontos: PontoMensal[];
  /** Campo do ponto usado como valor da série. */
  campo: "totalPlanejado" | "aReembolsar";
  cor: string;
}

interface TooltipParam {
  dataIndex: number;
}

export const GraficoLinhaMensal = ({ pontos, campo, cor }: Props) => {
  const option = useMemo(() => {
    const mesAtual = pontos.find((ponto) => ponto.ehMesAtual)?.label;

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: { type: "dashed", color: cor, opacity: 0.6, width: 1 },
        },
        formatter: (params: TooltipParam[]) => {
          const ponto = pontos[params[0].dataIndex];
          const sufixo = ponto.ehMesAtual ? " (mês atual)" : "";
          return `${ponto.label}${sufixo}: <b>${formatNumberToCurrency(ponto[campo])}</b>`;
        },
      },
      grid: { left: 0, right: 5, top: 12, bottom: 22, containLabel: false },
      xAxis: {
        type: "category",
        data: pontos.map((ponto) => ponto.label),
        axisLine: { show: false },
        axisTick: { show: false },
        boundaryGap: false,
        axisLabel: {
          fontSize: 10,
          // Força o rótulo de todos os meses, sem pular de dois em dois.
          interval: 0,
          hideOverlap: false,
          // Encosta o primeiro e o último rótulo nas bordas para a linha ocupar toda a largura.
          alignMinLabel: "left",
          alignMaxLabel: "right",
          // O mês atual fica em destaque também no eixo.
          formatter: (valor: string) => (valor === mesAtual ? `{atual|${valor}}` : valor),
          rich: { atual: { fontSize: 10, fontWeight: 700, color: cor } },
          color: "#6B6583",
        },
      },
      yAxis: { type: "value", show: false },
      series: [
        {
          type: "line",
          smooth: true,
          // Deixa o marcador do mês atual aparecer inteiro mesmo colado na borda.
          clip: false,
          symbol: "circle",
          lineStyle: { width: 2, color: cor },
          areaStyle: { color: cor, opacity: 0.1 },
          data: pontos.map((ponto) => ({
            value: ponto[campo],
            symbolSize: ponto.ehMesAtual ? 9 : 4,
            itemStyle: {
              color: cor,
              borderColor: "#FFFFFF",
              borderWidth: ponto.ehMesAtual ? 2 : 0,
            },
          })),
          markLine: {
            silent: true,
            symbol: "none",
            label: { show: false },
            lineStyle: { type: "dashed", color: cor, opacity: 0.4 },
            data: mesAtual ? [{ xAxis: mesAtual }] : [],
          },
        },
      ],
    };
  }, [pontos, campo, cor]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 160, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
};
