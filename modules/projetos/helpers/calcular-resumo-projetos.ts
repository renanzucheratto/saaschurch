import { getStatusInfo } from "@/config/helpers/projeto-status";
import type { ProjetoListagem, StatusProjetoNome } from "@/types/projeto.types";
import {
  ORDEM_STATUS,
  STATUS_AGUARDANDO_REEMBOLSO,
  STATUS_EM_ANDAMENTO,
  STATUS_REEMBOLSADO,
} from "./constants";
import { calcularSerieMensal } from "./calcular-serie-mensal";
import type { ResumoProjetos } from "../types";

const getStatus = (projeto: ProjetoListagem): StatusProjetoNome =>
  projeto.status?.nome || "em_analise";

export const calcularResumoProjetos = (projetos: ProjetoListagem[]): ResumoProjetos => {
  const ativos = projetos.filter((projeto) => getStatus(projeto) !== "recusado");
  const emAndamento = projetos.filter((projeto) =>
    STATUS_EM_ANDAMENTO.includes(getStatus(projeto)),
  );
  const aguardando = projetos.filter((projeto) =>
    STATUS_AGUARDANDO_REEMBOLSO.includes(getStatus(projeto)),
  );
  const reembolsados = projetos.filter((projeto) =>
    STATUS_REEMBOLSADO.includes(getStatus(projeto)),
  );

  const somar = (lista: ProjetoListagem[]) =>
    lista.reduce((acc, projeto) => acc + (Number(projeto.valor_total) || 0), 0);

  const porStatus = ORDEM_STATUS.map((status) => {
    const doStatus = projetos.filter((projeto) => getStatus(projeto) === status);
    return {
      status,
      label: getStatusInfo(status).label,
      chipColor: getStatusInfo(status).color,
      quantidade: doStatus.length,
      valor: somar(doStatus),
    };
  });

  return {
    totalPlanejado: somar(ativos),
    qtdAtivos: ativos.length,
    qtdEmAndamento: emAndamento.length,
    aguardandoReembolso: somar(aguardando),
    qtdAguardando: aguardando.length,
    jaReembolsado: somar(reembolsados),
    totalProjetos: projetos.length,
    porStatus,
    serieMensal: calcularSerieMensal(projetos),
  };
};
