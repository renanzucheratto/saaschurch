import type { SxProps, Theme } from "@mui/material";

export const useProjetosStyles = () => {
  const titulo: SxProps<Theme> = { fontWeight: 700 };

  const novoProjetoButton: SxProps<Theme> = {
    borderRadius: 1.5,
    textTransform: "none",
    fontWeight: 600,
  };

  const bigNumberConteudo: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    minWidth: 0,
  };

  const bigNumberIcone = (cor: string, fundo: string): SxProps<Theme> => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    bgcolor: fundo,
    color: cor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  });

  const bigNumberValor: SxProps<Theme> = {
    fontSize: { xs: "1.5rem", md: "1.875rem" },
    lineHeight: 1.2,
    fontWeight: 700,
  };

  /** Ocupa a área interna do card (respeitando o padding do CardContent). */
  const graficoContainer: SxProps<Theme> = {
    mt: "auto",
    width: "100%",
  };

  const filtroStatus: SxProps<Theme> = {
    minWidth: { xs: "100%", sm: 280 },
    "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: "background.paper" },
  };

  const dataGrid: SxProps<Theme> = {
    border: "none",
    "& .MuiDataGrid-columnHeaders": {
      bgcolor: "grey.50",
      borderBottom: "2px solid",
      borderColor: "divider",
      fontWeight: 600,
    },
    "& .MuiDataGrid-cell": { borderBottom: "1px solid", borderColor: "divider" },
    "& .MuiDataGrid-row": {
      cursor: "pointer",
      "&:hover": { bgcolor: "grey.100" },
    },
  };

  return {
    titulo,
    novoProjetoButton,
    bigNumberConteudo,
    bigNumberIcone,
    bigNumberValor,
    graficoContainer,
    filtroStatus,
    dataGrid,
  };
};
