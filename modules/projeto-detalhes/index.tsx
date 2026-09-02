"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { CardWithTitle } from "@/components/card-with-title";
import { useProjetoDetalhes } from "./hooks/use-projeto-detalhes";
import { ANCORA_COMPROVANTES, ANCORA_NOTAS_FISCAIS } from "./helpers/constants";
import { FluxoProjeto } from "./components/fluxo-projeto";
import { InformacoesCard } from "./components/informacoes-card";
import { ItensCard } from "./components/itens-card";
import { AnexosCard } from "./components/anexos-card";
import { AlterarStatusModal } from "./components/alterar-status-modal";
import ProjetoDrawer from "./components/projeto-drawer";
import { useProjetoDetalhesStyles } from "./styles";

export default function ProjetoDetalhesModule() {
  const styles = useProjetoDetalhesStyles();
  const {
    projeto,
    isLoading,
    statusInfo,
    ehRecusado,
    etapas,
    indiceEtapa,
    acoes,
    requisitos,
    temPendencia,
    acoesDesabilitadas,
    podeEditar,
    mostrarNotas,
    podeGerenciarNotas,
    mostrarComprovantes,
    podeGerenciarComprovantes,
    drawerOpen,
    abrirDrawer,
    fecharDrawer,
    statusAction,
    selecionarAcao,
    limparAcao,
    alert,
    fecharAlert,
    showSuccess,
    showError,
    voltarParaListagem,
  } = useProjetoDetalhes();

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
        <Button onClick={voltarParaListagem} sx={{ mt: 2, textTransform: "none" }}>
          Voltar para projetos
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }} flexWrap="wrap">
        <IconButton onClick={voltarParaListagem} sx={styles.voltarButton}>
          <IconifyIcon icon="material-symbols:arrow-back" width={18} />
        </IconButton>
        <Typography variant="h6" sx={styles.titulo}>
          {projeto.nome}
        </Typography>
        <Chip label={statusInfo.label} color={statusInfo.color} sx={{ fontWeight: 600 }} />
        {podeEditar && (
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="material-symbols:edit-outline" width={18} />}
            onClick={abrirDrawer}
            sx={styles.acaoButton}
          >
            Editar
          </Button>
        )}
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <InformacoesCard projeto={projeto} />
            </Grid>

            <Grid size={12}>
              <ItensCard itens={projeto.itens} valorTotal={projeto.valor_total} />
            </Grid>

            {projeto.ideias && (
              <Grid size={12}>
                <CardWithTitle title="Ideias e detalhamento">
                  <Box
                    sx={styles.conteudoHtml}
                    dangerouslySetInnerHTML={{ __html: projeto.ideias }}
                  />
                </CardWithTitle>
              </Grid>
            )}

            {mostrarNotas && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <AnexosCard
                  projetoId={projeto.id}
                  anexos={projeto.anexos}
                  tipo="nota_fiscal"
                  titulo="Notas fiscais"
                  descricao="Comprovantes de compra dos insumos"
                  ancora={ANCORA_NOTAS_FISCAIS}
                  podeGerenciar={podeGerenciarNotas}
                  onSuccess={showSuccess}
                  onError={showError}
                />
              </Grid>
            )}

            {mostrarComprovantes && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <AnexosCard
                  projetoId={projeto.id}
                  anexos={projeto.anexos}
                  tipo="comprovante_pagamento"
                  titulo="Comprovante de reembolso"
                  descricao="Transferência ou recibo emitido pelo backoffice"
                  ancora={ANCORA_COMPROVANTES}
                  podeGerenciar={podeGerenciarComprovantes}
                  onSuccess={showSuccess}
                  onError={showError}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <FluxoProjeto
            etapas={etapas}
            indiceEtapa={indiceEtapa}
            ehRecusado={ehRecusado}
            justificativa={projeto.status?.justificativa}
            acoes={acoes}
            requisitos={requisitos}
            temPendencia={temPendencia}
            acoesDesabilitadas={acoesDesabilitadas}
            podeEditar={podeEditar}
            onEditar={abrirDrawer}
            onAcao={selecionarAcao}
          />
        </Grid>
      </Grid>

      <ProjetoDrawer open={drawerOpen} onClose={fecharDrawer} projeto={projeto} />

      <AlterarStatusModal
        open={!!statusAction}
        onClose={limparAcao}
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
        onClose={fecharAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alert.severity} variant="filled" sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
