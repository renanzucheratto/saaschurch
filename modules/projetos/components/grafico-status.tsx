"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import type { ResumoStatus } from "../types";

interface Props {
  porStatus: ResumoStatus[];
}

interface TooltipParam {
  dataIndex: number;
}

export const GraficoStatus = ({ porStatus }: Props) => {
  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "none" },
        formatter: (params: TooltipParam[]) => {
          const item = porStatus[params[0].dataIndex];
          return `${item.label}: <b>${item.quantidade}</b> projeto(s)<br/>${formatNumberToCurrency(item.valor)}`;
        },
      },
      grid: { left: 0, right: 0, top: 20, bottom: 4, containLabel: true },
      xAxis: {
        type: "category",
        data: porStatus.map((item) => item.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 9, color: "#6B6583", interval: 0, rotate: 30 },
      },
      yAxis: { type: "value", show: false, minInterval: 1 },
      series: [
        {
          type: "bar",
          barMaxWidth: 22,
          data: porStatus.map((item) => ({
            value: item.quantidade,
            itemStyle: { color: item.cor, borderRadius: [4, 4, 0, 0] },
          })),
          label: {
            show: true,
            position: "top",
            fontSize: 11,
            fontWeight: 600,
            color: "#1A1624",
          },
        },
      ],
    }),
    [porStatus],
  );

  return (
    <ReactECharts
      option={option}
      style={{ height: 160, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
};
