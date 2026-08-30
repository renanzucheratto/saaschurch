"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { useObterProjetoQuery } from "@/config/redux/api/projetosApi";
import { useAppSelector } from "@/config/redux/store";
import { selectCurrentUser } from "@/config/redux/slices/authSlice";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { getStatusInfo } from "@/config/helpers/projeto-status";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import type { StatusProjetoNome } from "@/types/projeto.types";
import { CardWithTitle } from "@/components/card-with-title";
import { AlterarStatusModal } from "./components/AlterarStatusModal";
import { AnexosCard } from "./components/AnexosCard";
import ProjetoDrawer from "./components/ProjetoDrawer";

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

interface StatusAction {
  novoStatus: StatusProjetoNome;
  titulo: string;
  descricao: string;
  confirmColor: "primary" | "error" | "success";
}

export default function ProjetoDetalhesModule() {
  const params = useParams();
  const router = useRouter();
  const projetoId = (Array.isArray(params.id) ? params.id[0] : params.id) as string;

  const { data: projeto, isLoading } = useObterProjetoQuery(projetoId, { skip: !projetoId });
  const currentUser = useAppSelector(selectCurrentUser);
  const { is, can } = usePermissions();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSuccess = (message: string) => setAlert({ open: true, message, severity: "success" });
  const showError = (message: string) => setAlert({ open: true, message, severity: "error" });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!projeto) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Projeto não encontrado
        </Typography>
        <Button onClick={() => router.push("/projetos")} sx={{ mt: 2, textTransform: "none" }}>
          Voltar para projetos
        </Button>
      </Box>
    );
  }

  const ehDono = projeto.liderUserId === currentUser?.id;
  const ehBackoffice = is("backoffice");
  const ehLiderOuBackoffice = is("lider", "backoffice");
  const podeAprovar = can("aprovarProjeto");

  const status = projeto.status?.nome || "em_analise";
  const statusInfo = getStatusInfo(status);

  const podeEditar = (ehDono || ehBackoffice) && status === "em_analise";

  const mostrarNotas = ["aprovado", "em_reembolso", "liquidado", "finalizado"].includes(status);
  const podeGerenciarNotas =
    (ehDono || ehBackoffice) && ["aprovado", "em_reembolso"].includes(status);
  const mostrarComprovantes = ["em_reembolso", "liquidado", "finalizado"].includes(status);
  const podeGerenciarComprovantes =
    ehLiderOuBackoffice && ["em_reembolso", "liquidado"].includes(status);

  // Botões de ação de status conforme o status atual
  const acoes: StatusAction[] = [];
  if (status === "em_analise" && podeAprovar) {
    acoes.push({
      novoStatus: "aprovado",
      titulo: "Aprovar projeto",
      descricao: "O projeto será aprovado e o líder poderá iniciar a execução e solicitar reembolso.",
      confirmColor: "success",
    });
    acoes.push({
      novoStatus: "recusado",
      titulo: "Recusar projeto",
      descricao: "O projeto será recusado. Recomendamos informar o motivo na justificativa.",
      confirmColor: "error",
    });
  }
  if (status === "aprovado" && (ehDono || ehBackoffice)) {
    acoes.push({
      novoStatus: "em_reembolso",
      titulo: "Solicitar reembolso",
      descricao: "Confirme que todos os insumos foram comprados e as notas fiscais anexadas.",
      confirmColor: "primary",
    });
  }
  if (status === "em_reembolso" && ehLiderOuBackoffice) {
    acoes.push({
      novoStatus: "liquidado",
      titulo: "Liquidar projeto",
      descricao: "Confirme que o reembolso foi realizado e o comprovante anexado.",
      confirmColor: "success",
    });
  }
  if (status === "liquidado" && ehLiderOuBackoffice) {
    acoes.push({
      novoStatus: "finalizado",
      titulo: "Finalizar projeto",
      descricao: "O projeto será marcado como finalizado.",
      confirmColor: "primary",
    });
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }} flexWrap="wrap">
        <IconButton
          onClick={() => router.push("/projetos")}
          sx={{ bgcolor: "#F5F5F5", "&:hover": { bgcolor: "#E0E0E0" } }}
        >
          <IconifyIcon icon="material-symbols:arrow-back" width={18} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A1A", flex: 1 }}>
          {projeto.nome}
        </Typography>
        <Chip label={statusInfo.label} color={statusInfo.color} sx={{ fontWeight: 600 }} />
        {podeEditar && (
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="material-symbols:edit-outline" width={18} />}
            onClick={() => setDrawerOpen(true)}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
          >
            Editar
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        {/* Informações */}
        <Grid size={12}>
          <CardWithTitle title="Informações do projeto">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Líder
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {projeto.lider?.nome || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Valor planejado
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatNumberToCurrency(projeto.valor_total)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Início
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(projeto.data_inicio)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Término
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(projeto.data_fim)}
                </Typography>
              </Grid>
            </Grid>

            {projeto.descricao && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Descrição
                </Typography>
                <Typography variant="body2">{projeto.descricao}</Typography>
              </>
            )}

            {projeto.status?.justificativa && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Justificativa do status
                </Typography>
                <Typography variant="body2">{projeto.status.justificativa}</Typography>
              </>
            )}
          </CardWithTitle>
        </Grid>

        {/* Ações de status */}
        {acoes.length > 0 && (
          <Grid size={12}>
            <CardWithTitle title="Ações">
              <Stack direction="row" gap={2} flexWrap="wrap">
                {acoes.map((acao) => (
                  <Button
                    key={acao.novoStatus}
                    variant="contained"
                    color={acao.confirmColor}
                    onClick={() => setStatusAction(acao)}
                    sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
                  >
                    {acao.titulo}
                  </Button>
                ))}
              </Stack>
            </CardWithTitle>
          </Grid>
        )}

        {/* Itens */}
        <Grid size={12}>
          <CardWithTitle title="Itens do projeto">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Qtd.
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Valor unit.
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Subtotal
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projeto.itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>{item.descricao || "-"}</TableCell>
                      <TableCell align="center">{item.quantidade}</TableCell>
                      <TableCell align="right">{formatNumberToCurrency(Number(item.valor_unit))}</TableCell>
                      <TableCell align="right">
                        {formatNumberToCurrency(Number(item.valor_unit) * item.quantidade)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 700, border: 0 }}>
                      Total planejado
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, border: 0 }}>
                      {formatNumberToCurrency(projeto.valor_total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardWithTitle>
        </Grid>

        {/* Ideias */}
        {projeto.ideias && (
          <Grid size={12}>
            <CardWithTitle title="Ideias e detalhamento">
              <Box
                sx={{ "& p": { m: 0 }, fontSize: 14, color: "#333" }}
                dangerouslySetInnerHTML={{ __html: projeto.ideias }}
              />
            </CardWithTitle>
          </Grid>
        )}

        {/* Anexos: Notas fiscais */}
        {mostrarNotas && (
          <Grid size={{ xs: 12, md: 6 }}>
            <AnexosCard
              projetoId={projeto.id}
              anexos={projeto.anexos}
              tipo="nota_fiscal"
              titulo="Notas fiscais"
              descricao="Comprovantes de compra dos insumos"
              podeGerenciar={podeGerenciarNotas}
              onSuccess={showSuccess}
              onError={showError}
            />
          </Grid>
        )}

        {/* Anexos: Comprovante de pagamento */}
        {mostrarComprovantes && (
          <Grid size={{ xs: 12, md: 6 }}>
            <AnexosCard
              projetoId={projeto.id}
              anexos={projeto.anexos}
              tipo="comprovante_pagamento"
              titulo="Comprovante de reembolso"
              descricao="Transferência ou recibo assinado da tesouraria"
              podeGerenciar={podeGerenciarComprovantes}
              onSuccess={showSuccess}
              onError={showError}
            />
          </Grid>
        )}
      </Grid>

      <ProjetoDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} projeto={projeto} />

      <AlterarStatusModal
        open={!!statusAction}
        onClose={() => setStatusAction(null)}
        projetoId={projeto.id}
        novoStatus={statusAction?.novoStatus || null}
        titulo={statusAction?.titulo || ""}
        descricao={statusAction?.descricao}
        confirmColor={statusAction?.confirmColor}
        onSuccess={showSuccess}
        onError={showError}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alert.severity} variant="filled" sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
