import type { SxProps, Theme } from "@mui/material";

export const useProjetoDetalhesStyles = () => {
  const voltarButton: SxProps<Theme> = {
    bgcolor: "grey.100",
    "&:hover": { bgcolor: "grey.200" },
  };

  const titulo: SxProps<Theme> = { fontWeight: 700, color: "text.primary", flex: 1 };

  const painelFluxo: SxProps<Theme> = {
    position: { md: "sticky" },
    top: { md: 16 },
  };

  const stepper: SxProps<Theme> = {
    "& .MuiStepLabel-label": { fontWeight: 600 },
    "& .MuiStepLabel-label.Mui-active": { color: "primary.main" },
  };

  const acaoButton: SxProps<Theme> = {
    borderRadius: 1.5,
    textTransform: "none",
    fontWeight: 600,
  };

  const infoLabel: SxProps<Theme> = { display: "block" };

  const infoValor: SxProps<Theme> = { fontWeight: 600 };

  const conteudoHtml: SxProps<Theme> = {
    "& p": { m: 0 },
    fontSize: 14,
    color: "text.primary",
  };

  const linhaTotal: SxProps<Theme> = { fontWeight: 700, border: 0 };

  const cabecalhoTabela: SxProps<Theme> = { fontWeight: 600 };

  const anexoLinha: SxProps<Theme> = {
    p: 1,
    bgcolor: "grey.50",
    borderRadius: 1.5,
  };

  const anexoLink: SxProps<Theme> = {
    fontSize: 14,
    color: "primary.main",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const removerAnexo: SxProps<Theme> = {
    color: "text.secondary",
    "&:hover": { color: "error.main" },
  };

  return {
    voltarButton,
    titulo,
    painelFluxo,
    stepper,
    acaoButton,
    infoLabel,
    infoValor,
    conteudoHtml,
    linhaTotal,
    cabecalhoTabela,
    anexoLinha,
    anexoLink,
    removerAnexo,
  };
};
