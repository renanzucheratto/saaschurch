import { Chip, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { formatDate } from "@/config/helpers/format-date";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import { getStatusInfo } from "@/config/helpers/projeto-status";
import { AreaChip } from "@/components/area-chip";
import type { AreaResumo } from "@/types/projeto.types";
import { MAX_AREAS_NA_TABELA } from "./constants";

export const getColunasProjetos = (): GridColDef[] => [
  { field: "nome", headerName: "Projeto", flex: 1, minWidth: 220 },
  {
    field: "areas",
    headerName: "Áreas",
    flex: 1,
    minWidth: 200,
    sortable: false,
    valueGetter: (value: AreaResumo[]) => (value || []).map((area) => area.nome).join(", "),
    renderCell: (params) => {
      const areas: AreaResumo[] = params.row.areas || [];
      if (areas.length === 0) return "-";

      const visiveis = areas.slice(0, MAX_AREAS_NA_TABELA);
      const restante = areas.length - visiveis.length;

      return (
        <Stack direction="row" alignItems="center" gap={0.5} sx={{ height: "100%" }}>
          {visiveis.map((area) => (
            <AreaChip key={area.id} area={area} />
          ))}
          {restante > 0 && (
            <Typography variant="caption" sx={{ fontWeight: 600 }} color="text.secondary">
              +{restante}
            </Typography>
          )}
        </Stack>
      );
    },
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
