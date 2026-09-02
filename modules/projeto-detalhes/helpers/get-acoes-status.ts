import type { StatusProjetoNome } from "@/types/projeto.types";
import type { PermissoesProjeto, StatusAction } from "../types";

interface Params extends PermissoesProjeto {
  status: StatusProjetoNome;
}

export const getAcoesStatus = ({
  status,
  ehDono,
  ehBackoffice,
  ehLiderOuBackoffice,
  podeAprovar,
}: Params): StatusAction[] => {
  if (status === "em_analise" && podeAprovar) {
    return [
      {
        novoStatus: "aprovado",
        titulo: "Aprovar projeto",
        descricao:
          "O projeto será aprovado e o líder poderá iniciar a execução e solicitar reembolso.",
        confirmColor: "success",
        variant: "contained",
        icone: "material-symbols:check-circle-outline",
        exigeRequisitos: false,
      },
      {
        novoStatus: "recusado",
        titulo: "Recusar projeto",
        descricao: "O projeto será recusado. Recomendamos informar o motivo na justificativa.",
        confirmColor: "error",
        variant: "outlined",
        icone: "material-symbols:cancel-outline",
        exigeRequisitos: false,
      },
    ];
  }

  if (status === "aprovado" && (ehDono || ehBackoffice)) {
    return [
      {
        novoStatus: "em_reembolso",
        titulo: "Solicitar reembolso",
        descricao: "Confirme que todos os insumos foram comprados e as notas fiscais anexadas.",
        confirmColor: "primary",
        variant: "contained",
        icone: "material-symbols:request-quote-outline",
        exigeRequisitos: true,
      },
    ];
  }

  if (status === "em_reembolso" && ehLiderOuBackoffice) {
    return [
      {
        novoStatus: "liquidado",
        titulo: "Liquidar projeto",
        descricao: "Confirme que o reembolso foi realizado e o comprovante anexado.",
        confirmColor: "success",
        variant: "contained",
        icone: "material-symbols:payments-outline",
        exigeRequisitos: true,
      },
    ];
  }

  if (status === "liquidado" && ehLiderOuBackoffice) {
    return [
      {
        novoStatus: "finalizado",
        titulo: "Finalizar projeto",
        descricao: "O projeto será marcado como finalizado.",
        confirmColor: "primary",
        variant: "contained",
        icone: "material-symbols:flag-circle-outline",
        exigeRequisitos: false,
      },
    ];
  }

  return [];
};
