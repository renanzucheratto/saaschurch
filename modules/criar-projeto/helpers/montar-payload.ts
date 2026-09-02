import { formatCurrencyToNumber } from "@/config/helpers/currency-mask";
import type { CadastrarProjetoRequest, ItemProjetoRequest } from "@/config/redux/api/projetosApi";
import type { CriarProjetoSchema } from "../schemas/criar-projeto.schema";

export const montarPayload = (data: CriarProjetoSchema): CadastrarProjetoRequest => {
  const itens: ItemProjetoRequest[] = data.itens.map((item) => ({
    nome: item.nome,
    descricao: item.descricao || null,
    quantidade: Number(item.quantidade) || 1,
    valor_unit: formatCurrencyToNumber(item.valor_unit),
  }));

  return {
    nome: data.nome,
    descricao: data.descricao || null,
    ideias: data.ideias || null,
    data_inicio: data.data_inicio ? `${data.data_inicio}T00:00:00.000Z` : null,
    data_fim: data.data_fim ? `${data.data_fim}T00:00:00.000Z` : null,
    areaIds: data.areaIds,
    itens,
  };
};
