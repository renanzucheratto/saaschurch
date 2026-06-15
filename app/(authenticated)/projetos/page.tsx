"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress, Chip, Button, Card, Stack } from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { Icon as IconifyIcon } from "@iconify/react";
import { useListarProjetosQuery } from "@/config/redux/api/projetosApi";
import { useAppSelector } from "@/config/redux/store";
import { selectCurrentUser } from "@/config/redux/slices/authSlice";
import { getStatusInfo } from "@/config/helpers/projeto-status";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const columns: GridColDef[] = [
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

export default function ProjetosPage() {
  const router = useRouter();
  const { data: projetos = [], isLoading } = useListarProjetosQuery();
  const currentUser = useAppSelector(selectCurrentUser);

  const podeCriar = ["lider", "backoffice"].includes(currentUser?.userType || "");

  const handleRowClick = (params: GridRowParams) => {
    router.push(`/projetos/${params.id}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Projetos
        </Typography>
        {podeCriar && (
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:add" width={18} />}
            onClick={() => router.push("/projetos/criar")}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#5B5FED",
              "&:hover": { bgcolor: "#4A4EDC" },
            }}
          >
            Novo projeto
          </Button>
        )}
      </Stack>

      <Card variant="outlined">
        <DataGrid
          rows={projetos}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          onRowClick={handleRowClick}
          autoHeight
          density="standard"
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#FAFAFA",
              borderBottom: "2px solid #E0E0E0",
              fontWeight: 600,
            },
            "& .MuiDataGrid-cell": { borderBottom: "1px solid #F0F0F0" },
            "& .MuiDataGrid-row": {
              cursor: "pointer",
              "&:hover": { bgcolor: "#F5F5F5" },
            },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Card>
    </Box>
  );
}
