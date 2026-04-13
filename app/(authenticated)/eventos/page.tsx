"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Paper, CircularProgress, Chip, Button, Card } from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { ptBR } from '@mui/x-data-grid/locales';
import { useListarEventosQuery } from "@/config/redux/api/eventosApi";
import { Icon } from "@iconify/react";

const formatDateRange = (dataInicio: string | null, dataFim: string | null): string => {
  if (!dataInicio && !dataFim) return "-";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (dataInicio && dataFim) {
    return `${formatDate(dataInicio)} à ${formatDate(dataFim)}`;
  }

  return dataInicio ? formatDate(dataInicio) : (dataFim ? formatDate(dataFim) : "-");
};

const columns: GridColDef[] = [
  {
    field: "nome",
    headerName: "Nome",
    flex: 1,
    minWidth: 250,
  },
  {
    field: "data",
    headerName: "Data",
    flex: 1,
    minWidth: 250,
    valueGetter: (value, row) => formatDateRange(row.data_inicio, row.data_fim),
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params) => {
      const statusEvento = params.row.statusAtual ?? params.row.status ?? null;
      const statusNome = statusEvento?.nome || 'aberto';
      
      let color: 'success' | 'warning' | 'error' | 'default' = 'success';
      let label = 'Aberto';
      
      if (statusNome === 'aberto') {
        color = 'success';
        label = 'Aberto';
      } else if (statusNome === 'pausado') {
        color = 'warning';
        label = 'Pausado';
      } else if (statusNome === 'cancelado') {
        color = 'error';
        label = 'Cancelado';
      } else if (statusNome === 'finalizado') {
        color = 'default';
        label = 'Finalizado';
      }
      
      return <Chip label={label} color={color} size="small" sx={{ fontWeight: 600 }} />;
    },
  },
  {
    field: "quantidadeParticipantes",
    headerName: "Quantidade de Participantes",
    flex: 1,
    minWidth: 220,
  },
];

export default function EventosPage() {
  const router = useRouter();
  const { data: eventos = [], isLoading } = useListarEventosQuery();

  const handleRowClick = (params: GridRowParams) => {
    router.push(`/eventos/${params.id}`);
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
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
        Lista de Eventos
      </Typography>

      <Card variant="outlined">
        <DataGrid
          rows={eventos}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
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
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #F0F0F0",
            },
            "& .MuiDataGrid-row": {
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#F5F5F5",
              },
            },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Card>
    </Box>
  );
}
