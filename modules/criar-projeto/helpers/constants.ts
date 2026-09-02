import type { EtapaCriarProjeto } from "../types";

export const ETAPAS_CRIAR_PROJETO: EtapaCriarProjeto[] = [
  {
    id: "informacoes",
    titulo: "Informações",
    descricao: "Nome, áreas envolvidas, período e um resumo do que será feito.",
    campos: ["nome", "areaIds", "data_inicio", "data_fim", "descricao"],
  },
  {
    id: "detalhamento",
    titulo: "Detalhamento",
    descricao: "Explique as ideias, objetivos e o planejamento.",
    campos: ["ideias"],
  },
  {
    id: "orcamento",
    titulo: "Orçamento",
    descricao: "Liste os insumos que serão reembolsados.",
    campos: ["itens"],
  },
  {
    id: "revisao",
    titulo: "Revisão",
    descricao: "Confira tudo antes de enviar para análise.",
    campos: [],
  },
];

export const ITEM_PROJETO_VAZIO = {
  nome: "",
  descricao: "",
  quantidade: "1",
  valor_unit: "",
};

export const AVISO_ORCAMENTO =
  "Qualquer valor gasto acima do total planejado não será reembolsado pela igreja — a responsabilidade financeira é do líder do projeto.";
