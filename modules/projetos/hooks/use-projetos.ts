"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GridRowParams } from "@mui/x-data-grid";
import { useListarProjetosQuery } from "@/config/redux/api/projetosApi";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { calcularResumoProjetos } from "../helpers/calcular-resumo-projetos";
import { getColunasProjetos } from "../helpers/get-colunas-projetos";
import type { StatusProjetoNome } from "@/types/projeto.types";

export const useProjetos = () => {
  const router = useRouter();
  const { data: projetos = [], isLoading } = useListarProjetosQuery();
  const { can } = usePermissions();

  const [statusFiltro, setStatusFiltro] = useState<StatusProjetoNome[]>([]);

  const resumo = useMemo(() => calcularResumoProjetos(projetos), [projetos]);

  // Os bignumbers seguem mostrando a visão geral; o filtro age só sobre a tabela.
  const projetosFiltrados = useMemo(() => {
    if (statusFiltro.length === 0) return projetos;
    return projetos.filter((projeto) =>
      statusFiltro.includes(projeto.status?.nome || "em_analise"),
    );
  }, [projetos, statusFiltro]);
  const colunas = useMemo(() => getColunasProjetos(), []);

  return {
    projetos: projetosFiltrados,
    isLoading,
    statusFiltro,
    setStatusFiltro,
    resumo,
    colunas,
    podeCriar: can("criarProjeto"),
    irParaProjeto: (params: GridRowParams) => router.push(`/projetos/${params.id}`),
    irParaCriar: () => router.push("/projetos/criar"),
  };
};
