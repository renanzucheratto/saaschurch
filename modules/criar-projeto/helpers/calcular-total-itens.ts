import { formatCurrencyToNumber } from "@/config/helpers/currency-mask";
import type { CriarProjetoSchema } from "../schemas/criar-projeto.schema";

type ItensParciais = Partial<CriarProjetoSchema["itens"][number]>[] | undefined;

export const calcularTotalItens = (itens: ItensParciais): number =>
  (itens || []).reduce((acc, item) => {
    const quantidade = Number(item?.quantidade) || 0;
    const valor = formatCurrencyToNumber(item?.valor_unit || "");
    return acc + quantidade * valor;
  }, 0);
