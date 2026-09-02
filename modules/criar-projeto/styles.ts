import type { SxProps, Theme } from "@mui/material";

export const useCriarProjetoStyles = () => {
  const voltarButton: SxProps<Theme> = {
    bgcolor: "grey.100",
    "&:hover": { bgcolor: "grey.200" },
  };

  const titulo: SxProps<Theme> = { fontWeight: 700, color: "text.primary" };

  const painelLateral: SxProps<Theme> = {
    position: { md: "sticky" },
    top: { md: 16 },
  };

  const stepper: SxProps<Theme> = {
    "& .MuiStepLabel-label": { fontWeight: 600 },
    "& .MuiStepLabel-label.Mui-active": { color: "primary.main" },
    "& .MuiStepConnector-line": { minHeight: 16 },
  };

  const stepButton: SxProps<Theme> = {
    justifyContent: "flex-start",
    textAlign: "left",
    px: 1,
    borderRadius: 1.5,
    textTransform: "none",
    m: 0,
  };

  const totalBox: SxProps<Theme> = {
    p: 1.5,
    borderRadius: 1.5,
    bgcolor: "grey.50",
    border: "1px solid",
    borderColor: "divider",
  };

  const input: SxProps<Theme> = { "& .MuiOutlinedInput-root": { borderRadius: 1.5 } };

  const itemCard: SxProps<Theme> = { p: 2, bgcolor: "grey.50", position: "relative" };

  const removerItem: SxProps<Theme> = {
    position: "absolute",
    top: 8,
    right: 8,
    color: "text.secondary",
    "&:hover": { color: "error.main" },
  };

  const acaoButton: SxProps<Theme> = {
    borderRadius: 1.5,
    textTransform: "none",
    fontWeight: 600,
    px: 3,
  };

  const revisaoLinha: SxProps<Theme> = {
    py: 1,
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  return {
    voltarButton,
    titulo,
    painelLateral,
    stepper,
    stepButton,
    totalBox,
    input,
    itemCard,
    removerItem,
    acaoButton,
    revisaoLinha,
  };
};
