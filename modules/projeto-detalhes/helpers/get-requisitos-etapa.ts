import type { AnexoProjeto, StatusProjetoNome } from "@/types/projeto.types";
import type { RequisitoEtapa } from "../types";

export const getRequisitosEtapa = (
  status: StatusProjetoNome,
  anexos: AnexoProjeto[],
): RequisitoEtapa[] => {
  const contar = (tipo: AnexoProjeto["tipo"]) => anexos.filter((a) => a.tipo === tipo).length;

  if (status === "aprovado") {
    const notas = contar("nota_fiscal");
    return [
      {
        label: notas > 0 ? `${notas} nota(s) fiscal(is) anexada(s)` : "Anexar as notas fiscais",
        atendido: notas > 0,
      },
    ];
  }

  if (status === "em_reembolso") {
    const comprovantes = contar("comprovante_pagamento");
    return [
      {
        label:
          comprovantes > 0
            ? "Comprovante de reembolso anexado"
            : "Anexar o comprovante do reembolso",
        atendido: comprovantes > 0,
      },
    ];
  }

  return [];
};
