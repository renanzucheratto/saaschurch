import type { ProjetoListagem, StatusProjetoNome } from "@/types/projeto.types";
import { MESES_SERIE, STATUS_AGUARDANDO_REEMBOLSO } from "./constants";
import type { PontoMensal } from "../types";

/**
 * Distribui os projetos nos últimos meses pela data de criação, somando o valor
 * planejado e o valor que ainda será reembolsado em cada mês.
 */
export const calcularSerieMensal = (projetos: ProjetoListagem[]): PontoMensal[] => {
  const hoje = new Date();

  const pontos: PontoMensal[] = Array.from({ length: MESES_SERIE }, (_, indice) => {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - (MESES_SERIE - 1 - indice), 1);
    return {
      ano: data.getFullYear(),
      mes: data.getMonth(),
      label: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      ehMesAtual: indice === MESES_SERIE - 1,
      totalPlanejado: 0,
      aReembolsar: 0,
    };
  });

  projetos.forEach((projeto) => {
    if (!projeto.createdAt) return;
    const data = new Date(projeto.createdAt);
    if (isNaN(data.getTime())) return;

    const ponto = pontos.find(
      (item) => item.ano === data.getFullYear() && item.mes === data.getMonth(),
    );
    if (!ponto) return;

    const status: StatusProjetoNome = projeto.status?.nome || "em_analise";
    const valor = Number(projeto.valor_total) || 0;

    if (status !== "recusado") ponto.totalPlanejado += valor;
    if (STATUS_AGUARDANDO_REEMBOLSO.includes(status)) ponto.aReembolsar += valor;
  });

  return pontos;
};
