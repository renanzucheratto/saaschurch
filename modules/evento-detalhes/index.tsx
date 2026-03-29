"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Card,
  Grid,
  Stack,
  Button,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useObterEventoQuery, useListarParticipantesQuery } from "@/config/redux/api/eventosApi";
import { ProdutoParticipante } from "@/types/evento.types";
import ParticipantesPorProdutoChart from "./components/ParticipantesPorProdutoChart";
import { useState, useMemo } from "react";
import { Tabs, Tab } from "@mui/material";
import ParticipanteDrawer from "./components/ParticipanteDrawer";
import ParticipantesPizzaChart from "./components/ParticipantesPizzaChart";
import EventoDrawer from "./components/EventoDrawer";
import { QRCodeSVG } from "qrcode.react";

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
    field: "status",
    headerName: "Status de Pagamento",
    width: 220,
    renderCell: (params) => {
      if (!params.row.produtos || params.row.produtos.length === 0) return "-";

      // Determine overall status based on products
      const statuses = params.row.produtos.map((p: ProdutoParticipante) => p.status || 'PAGO');
      let finalStatus = 'PAGO';
      if (statuses.includes('PENDENTE')) finalStatus = 'PENDENTE';
      else if (statuses.includes('PARCIALMENTE_PAGO')) finalStatus = 'PARCIALMENTE_PAGO';
      else if (statuses.every((s: string) => s === 'QUITADO' || s === 'PAGO')) finalStatus = statuses.includes('QUITADO') ? 'QUITADO' : 'PAGO';

      let color = 'success';
      let label = 'Pago';

      if (finalStatus === 'QUITADO') {
        color = 'success';
        label = 'Quitado';
      } else if (finalStatus === 'PARCIALMENTE_PAGO') {
        color = 'warning';
        label = 'Parcial. Pago';
      } else if (finalStatus === 'PENDENTE') {
        color = 'error';
        label = 'Pendente';
      }

      return <Chip label={label} color={color as any} size="small" sx={{ fontWeight: 600 }} />;
    }
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function EventoDetalhesModule() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id as string;

  const [currentTab, setCurrentTab] = useState(0); // 0 = Ativos, 1 = Inativos
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedParticipanteId, setSelectedParticipanteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [eventoDrawerOpen, setEventoDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const eventoLink = `${process.env.NEXT_PUBLIC_APP_URL}/externo/eventos/${eventoId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventoLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector("#qr-code-svg") as SVGGraphicsElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000; // High resolution
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 900, 900);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qrcode-${evento?.nome || "evento"}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const { data: evento, isLoading: isLoadingEvento } = useObterEventoQuery(eventoId);

  const { data: participantesAtivos = [], isLoading: isLoadingAtivos } = useListarParticipantesQuery({
    eventoId,
    isDeleted: false
  });

  const { data: participantesInativos = [], isLoading: isLoadingInativos } = useListarParticipantesQuery({
    eventoId,
    isDeleted: true
  });

  const handleRowClick = (params: any) => {
    setSelectedParticipanteId(params.row.id);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setSelectedParticipanteId(null);
  };

  const allParticipantes = [...participantesAtivos, ...participantesInativos];
  const selectedParticipante = allParticipantes.find((p) => p.id === selectedParticipanteId) || null;

  const isLoading = isLoadingEvento;

  const gridColumns = useMemo(() => {
    if (!evento) return participantesColumns;
    const temProdutos = evento.produtos && evento.produtos.length > 0;

    if (temProdutos) return participantesColumns;

    return participantesColumns.filter(
      col => col.field !== "produto" && col.field !== "valor"
    );
  }, [evento]);

  const filterParticipantes = (participantes: any[]) => {
    if (!searchTerm) return participantes;
    const lowerSearch = searchTerm.toLowerCase();
    const numericSearch = searchTerm.replace(/\D/g, "");

    return participantes.filter((p) => {
      // Verifica se algum valor no objeto (incluindo campos formatados) bate com a busca
      return Object.entries(p).some(([key, value]) => {
        if (value === null || value === undefined) return false;

        // Compara string normal
        const stringValue = String(value).toLowerCase();
        if (stringValue.includes(lowerSearch)) return true;

        // Compara apenas dígitos para campos que costumam ter formatação (telefone, cpf, rg, valor, etc)
        if (numericSearch && (typeof value === "string" || typeof value === "number")) {
          const digitsOnly = String(value).replace(/\D/g, "");
          if (digitsOnly.length > 0 && digitsOnly.includes(numericSearch)) return true;
        }

        // Busca em produtos vinculados
        if (key === "produtos" && Array.isArray(value)) {
          return value.some((prod) => {
            const prodString = JSON.stringify(prod).toLowerCase();
            const prodDigits = JSON.stringify(prod).replace(/\D/g, "");
            return (
              prodString.includes(lowerSearch) ||
              (numericSearch && prodDigits.includes(numericSearch))
            );
          });
        }

        return false;
      });
    });
  };

  const filteredAtivos = useMemo(() => filterParticipantes(participantesAtivos), [participantesAtivos, searchTerm]);
  const filteredInativos = useMemo(() => filterParticipantes(participantesInativos), [participantesInativos, searchTerm]);

  if (isLoading && !evento) {
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
    <Grid container spacing={2}>
      {/* Header com botão voltar */}
      <Grid size={12}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={2}>
            <IconButton
              onClick={() => router.push("/eventos")}
              sx={{
                bgcolor: "#F5F5F5",
                "&:hover": { bgcolor: "#E0E0E0" },
              }}
            >
              <IconifyIcon icon="material-symbols:arrow-back" width={18} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
              {evento.nome}
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="material-symbols:edit-outline" width={18} />}
            onClick={() => setEventoDrawerOpen(true)}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Editar Evento
          </Button>
        </Stack>
      </Grid>

      {/* Informações do Evento */}
      <Grid size={12}>
        <Card variant="outlined">
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
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
        </Card>
      </Grid>

      {/* QR Code e Link do Evento */}
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined">
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Link do Evento
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
            <Box
              sx={{
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                border: "1px solid #E0E0E0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QRCodeSVG id="qr-code-svg" value={eventoLink} size={160} level="H" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, display: "block", mb: 0.5 }}>
                URL pública do evento
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  wordBreak: "break-all",
                  color: "#5B5FED",
                  fontWeight: 500,
                  mb: 1.5,
                }}
              >
                {eventoLink}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title={copied ? "Copiado!" : "Copiar link"} arrow>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<IconifyIcon icon={copied ? "material-symbols:check" : "material-symbols:content-copy"} width={16} />}
                    onClick={handleCopyLink}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {copied ? "Copiado" : "Copiar link"}
                  </Button>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconifyIcon icon="material-symbols:download" width={16} />}
                  onClick={handleDownloadQR}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Baixar QR Code
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconifyIcon icon="material-symbols:open-in-new" width={16} />}
                  component="a"
                  href={eventoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Abrir
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Grid>

      {/* Gráficos de Participantes */}
      {evento.produtos && evento.produtos.length > 0 && (
        <>
          {eventoId === "65b6b327-c769-454f-b274-2d21dd8b4229" ? (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <ParticipantesPorProdutoChart eventoId={eventoId} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ParticipantesPizzaChart eventoId={eventoId} />
              </Grid>
            </>
          ) : (
            <Grid size={12}>
              <ParticipantesPorProdutoChart eventoId={eventoId} />
            </Grid>
          )}
        </>
      )}

      <Grid size={12}>
        {/* Listagem de Participantes com Tabs */}
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Ativos" />
              <Tab label="Inativos" />
            </Tabs>
          </Box>

          <CustomTabPanel value={currentTab} index={0}>
            <Card variant="outlined">
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "start", sm: "center" }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Participantes Ativos ({filteredAtivos.length})
                </Typography>
                <TextField
                  placeholder="Buscar em todos os dados..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconifyIcon icon="material-symbols:search" width={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: { xs: "100%", sm: 300 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "white",
                    },
                  }}
                />
              </Stack>
              <DataGrid
                rows={filteredAtivos}
                columns={gridColumns}
                loading={isLoadingAtivos}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                disableRowSelectionOnClick
                onRowClick={handleRowClick}
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
            </Card>
          </CustomTabPanel>

          <CustomTabPanel value={currentTab} index={1}>
            <Card variant="outlined">
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "start", sm: "center" }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Participantes Inativos ({filteredInativos.length})
                </Typography>
                <TextField
                  placeholder="Buscar em todos os dados..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconifyIcon icon="material-symbols:search" width={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: { xs: "100%", sm: 300 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "white",
                    },
                  }}
                />
              </Stack>
              <DataGrid
                rows={filteredInativos}
                columns={gridColumns}
                loading={isLoadingInativos}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                disableRowSelectionOnClick
                onRowClick={handleRowClick}
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
            </Card>
          </CustomTabPanel>
        </Box>
      </Grid>

      <ParticipanteDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        participante={selectedParticipante}
        eventoId={eventoId}
        produtos={evento.produtos || []}
      />

      <EventoDrawer
        open={eventoDrawerOpen}
        onClose={() => setEventoDrawerOpen(false)}
        evento={evento as any}
      />
    </Grid>
  );
}
