import { Chip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { formatDate } from "@/config/helpers/format-date";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import { getStatusInfo } from "@/config/helpers/projeto-status";

export const getColunasProjetos = (): GridColDef[] => [
  { field: "nome", headerName: "Projeto", flex: 1, minWidth: 220 },
  {
    field: "lider",
    headerName: "Líder",
    flex: 1,
    minWidth: 180,
    valueGetter: (value, row) => row.lider?.nome || "-",
  },
  {
    field: "data_inicio",
    headerName: "Início",
    width: 120,
    valueGetter: (value) => formatDate(value),
  },
  {
    field: "data_fim",
    headerName: "Término",
    width: 120,
    valueGetter: (value) => formatDate(value),
  },
  {
    field: "valor_total",
    headerName: "Valor planejado",
    width: 160,
    valueGetter: (value) => formatNumberToCurrency(Number(value) || 0),
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => {
      const info = getStatusInfo(params.row.status?.nome);
      return <Chip label={info.label} color={info.color} size="small" sx={{ fontWeight: 600 }} />;
    },
  },
  {
    field: "createdAt",
    headerName: "Criado em",
    width: 120,
    valueGetter: (value) => formatDate(value),
  },
];
