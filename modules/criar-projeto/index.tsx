"use client";

import { Alert, Box, Button, Grid, IconButton, Snackbar, Stack, Typography } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { CardWithTitle } from "@/components/card-with-title";
import { useCriarProjeto } from "./hooks/use-criar-projeto";
import { StepperCriacao } from "./components/stepper-criacao";
import { StepInformacoes } from "./components/step-informacoes";
import { StepDetalhamento } from "./components/step-detalhamento";
import { StepOrcamento } from "./components/step-orcamento";
import { StepRevisao } from "./components/step-revisao";
import { useCriarProjetoStyles } from "./styles";

export default function CriarProjetoModule() {
  const styles = useCriarProjetoStyles();
  const {
    form,
    itensArray,
    etapas,
    etapa,
    etapaAtual,
    etapasConcluidas,
    ehUltimaEtapa,
    etapaTemErro,
    avancar,
    voltar,
    irParaEtapa,
    total,
    isLoading,
    isValid,
    alert,
    fecharAlert,
    onSubmit,
    voltarParaListagem,
  } = useCriarProjeto();

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }}>
        <IconButton onClick={voltarParaListagem} sx={styles.voltarButton}>
          <IconifyIcon icon="material-symbols:arrow-back" width={18} />
        </IconButton>
        <Box>
          <Typography variant="h6" sx={styles.titulo}>
            Criar projeto
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Etapa {etapaAtual + 1} de {etapas.length} — {etapa.titulo}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <StepperCriacao
            etapas={etapas}
            etapaAtual={etapaAtual}
            etapasConcluidas={etapasConcluidas}
            etapaTemErro={etapaTemErro}
            onSelecionarEtapa={irParaEtapa}
            total={total}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Box>
            <CardWithTitle
              title={
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {etapa.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {etapa.descricao}
                  </Typography>
                </>
              }
            >
              {etapa.id === "informacoes" && <StepInformacoes form={form} />}
              {etapa.id === "detalhamento" && <StepDetalhamento form={form} />}
              {etapa.id === "orcamento" && (
                <StepOrcamento form={form} itensArray={itensArray} total={total} />
              )}
              {etapa.id === "revisao" && (
                <StepRevisao form={form} total={total} onEditarEtapa={irParaEtapa} />
              )}
            </CardWithTitle>

            <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mt: 3 }}>
              <Button
                type="button"
                variant="text"
                onClick={etapaAtual === 0 ? voltarParaListagem : voltar}
                startIcon={<IconifyIcon icon="material-symbols:chevron-left" width={20} />}
                sx={styles.acaoButton}
              >
                {etapaAtual === 0 ? "Cancelar" : "Voltar"}
              </Button>

              {ehUltimaEtapa ? (
                <Button
                  key="criar"
                  type="button"
                  variant="contained"
                  disabled={isLoading || !isValid}
                  onClick={onSubmit}
                  sx={styles.acaoButton}
                >
                  {isLoading ? "Criando..." : "Criar projeto"}
                </Button>
              ) : (
                <Button
                  key="continuar"
                  type="button"
                  variant="contained"
                  onClick={avancar}
                  endIcon={<IconifyIcon icon="material-symbols:chevron-right" width={20} />}
                  sx={styles.acaoButton}
                >
                  Continuar
                </Button>
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={fecharAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={fecharAlert} severity={alert.severity} variant="filled" sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
