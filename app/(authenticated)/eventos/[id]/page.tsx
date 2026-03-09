"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useObterEventoQuery, useListarParticipantesQuery } from "@/config/redux/api/eventosApi";
import { ProdutoParticipante } from "@/types/evento.types";
import ParticipantesPorProdutoChart from "./components/ParticipantesPorProdutoChart";

const formatDateRange = (dataInicio: string | null, dataFim: string | null): string => {
  if (!dataInicio && !dataFim) return "-";
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (dataInicio && dataFim) {
    return `${formatDate(dataInicio)} à ${formatDate(dataFim)}`;
  }
  
  return dataInicio ? formatDate(dataInicio) : (dataFim ? formatDate(dataFim) : "-");
};

const participantesColumns: GridColDef[] = [
  {
    field: "nome",
    headerName: "Nome",
    flex: 1,
    minWidth: 200,
  },
  {
    field: "email",
    headerName: "Email",
    flex: 1,
    minWidth: 200,
  },
  {
    field: "telefone",
    headerName: "Telefone",
    width: 150,
  },
  {
    field: "termo_assinado",
    headerName: "Termo Assinado",
    width: 150,
    renderCell: (params) => (
      <Chip
        label={params.value ? "Sim" : "Não"}
        size="small"
        color={params.value ? "success" : "error"}
        sx={{ fontWeight: 600 }}
      />
    ),
  },
  {
    field: "produto",
    headerName: "Produto",
    flex: 1,
    minWidth: 250,
    valueGetter: (value, row) => {
      return row.produtos && row.produtos.length > 0
        ? row.produtos.map((p: ProdutoParticipante) => p.nome).join(", ")
        : "-";
    },
  },
  {
    field: "valor",
    headerName: "Valor",
    width: 120,
    valueGetter: (value, row) => {
      if (!row.produtos || row.produtos.length === 0) return 0;
      const total = row.produtos.reduce((sum: number, p: ProdutoParticipante) => sum + p.valor, 0);
      return total;
    },
    valueFormatter: (value) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
  },
];

export default function EventoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id as string;

  const { data: evento, isLoading: isLoadingEvento } = useObterEventoQuery(eventoId);
  const { data: participantes = [], isLoading: isLoadingParticipantes } = useListarParticipantesQuery(eventoId);

  const isLoading = isLoadingEvento || isLoadingParticipantes;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!evento) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Evento não encontrado
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header com botão voltar */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <IconButton
          onClick={() => router.push("/eventos")}
          sx={{
            bgcolor: "#F5F5F5",
            "&:hover": { bgcolor: "#E0E0E0" },
          }}
        >
          <IconifyIcon icon="material-symbols:arrow-back" width={24} />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
          {evento.nome}
        </Typography>
      </Box>

      {/* Informações do Evento */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid #E0E0E0",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Informações do Evento
        </Typography>

        <Box sx={{ display: "grid", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>
              Data
            </Typography>
            <Typography variant="body1">
              {formatDateRange(evento.data_inicio, evento.data_fim)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: "#666", fontWeight: 600 }}>
              Descrição
            </Typography>
            <Typography variant="body1">{evento.descricao}</Typography>
          </Box>

          {evento.produtos && evento.produtos.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, mb: 1, display: "block" }}>
                Produtos Disponíveis
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {evento.produtos.map((produto) => (
                  <Chip
                    key={produto.id}
                    label={produto.nome}
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Gráfico de Participantes por Produto */}
      <Box sx={{ mb: 3 }}>
        <ParticipantesPorProdutoChart eventoId={eventoId} />
      </Box>

      {/* Listagem de Participantes */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#1A1A1A" }}>
        Participantes ({participantes.length})
      </Typography>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          border: "1px solid #E0E0E0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={participantes}
          columns={participantesColumns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
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
            "& .MuiDataGrid-row:hover": {
              bgcolor: "#F5F5F5",
            },
          }}
        />
      </Paper>
    </Box>
  );
}
