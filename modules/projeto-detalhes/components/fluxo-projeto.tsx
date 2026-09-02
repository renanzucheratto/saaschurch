"use client";

import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { CardWithTitle } from "@/components/card-with-title";
import type { EtapaProjeto } from "@/config/helpers/projeto-fluxo";
import { useProjetoDetalhesStyles } from "../styles";
import type { RequisitoEtapa, StatusAction } from "../types";

interface Props {
  etapas: EtapaProjeto[];
  indiceEtapa: number;
  ehRecusado: boolean;
  justificativa?: string | null;
  acoes: StatusAction[];
  requisitos: RequisitoEtapa[];
  temPendencia: boolean;
  acoesDesabilitadas: boolean;
  podeEditar: boolean;
  onEditar: () => void;
  onAcao: (acao: StatusAction) => void;
}

export const FluxoProjeto = ({
  etapas,
  indiceEtapa,
  ehRecusado,
  justificativa,
  acoes,
  requisitos,
  temPendencia,
  acoesDesabilitadas,
  podeEditar,
  onEditar,
  onAcao,
}: Props) => {
  const styles = useProjetoDetalhesStyles();
  const etapaAtual = etapas[indiceEtapa];

  return (
    <Box sx={styles.painelFluxo}>
      <CardWithTitle
        title={
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Andamento do projeto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ehRecusado
                ? "Projeto recusado pelo backoffice"
                : `Etapa ${indiceEtapa + 1} de ${etapas.length} — ${etapaAtual.titulo}`}
            </Typography>
          </>
        }
      >
        {ehRecusado ? (
          <Alert severity="error" sx={styles.alertCompacto}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Projeto recusado
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {justificativa || "Nenhuma justificativa foi informada pelo backoffice."}
            </Typography>
          </Alert>
        ) : (
          <Stepper activeStep={indiceEtapa} orientation="vertical" sx={styles.stepper}>
            {etapas.map((etapa, indice) => {
              const ehAtual = indice === indiceEtapa;
              const ehFutura = indice > indiceEtapa;

              return (
                <Step key={etapa.id} completed={indice < indiceEtapa}>
                  <StepLabel
                    optional={
                      <Typography variant="caption" color="text.secondary">
                        {ehFutura ? `Depende de ${etapa.responsavel}` : etapa.concluido}
                      </Typography>
                    }
                  >
                    {etapa.titulo}
                  </StepLabel>

                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {etapa.resumo}
                    </Typography>

                    {requisitos.length > 0 && (
                      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                        {requisitos.map((requisito) => (
                          <Stack
                            key={requisito.label}
                            direction="row"
                            alignItems="center"
                            gap={0.5}
                          >
                            <IconifyIcon
                              icon={
                                requisito.atendido
                                  ? "material-symbols:check-circle"
                                  : "material-symbols:radio-button-unchecked"
                              }
                              width={16}
                              color={requisito.atendido ? "#2e7d32" : "#ed6c02"}
                            />
                            <Typography variant="caption" sx={{ flex: 1 }}>
                              {requisito.label}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}

                    {ehAtual && acoes.length === 0 && (
                      <Alert severity="info" sx={styles.alertCompacto}>
                        <Typography variant="caption">
                          Nada a fazer por enquanto. Aguardando {etapa.responsavel}.
                        </Typography>
                      </Alert>
                    )}

                    {ehAtual && acoes.length > 0 && (
                      <Stack spacing={1}>
                        {temPendencia && acoes.some((acao) => acao.exigeRequisitos) && (
                          <Alert severity="warning" sx={styles.alertCompacto}>
                            <Typography variant="caption">
                              Anexe o documento acima para liberar a próxima etapa.
                            </Typography>
                          </Alert>
                        )}
                        {acoes.map((acao) => (
                          <Button
                            key={acao.novoStatus}
                            fullWidth
                            disabled={acoesDesabilitadas || (acao.exigeRequisitos && temPendencia)}
                            variant={acao.variant}
                            color={acao.confirmColor}
                            startIcon={<IconifyIcon icon={acao.icone} width={18} />}
                            onClick={() => onAcao(acao)}
                            sx={styles.acaoButton}
                          >
                            {acao.titulo}
                          </Button>
                        ))}
                      </Stack>
                    )}

                    {ehAtual && podeEditar && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Button
                          fullWidth
                          variant="text"
                          disabled={acoesDesabilitadas}
                          startIcon={
                            <IconifyIcon icon="material-symbols:edit-outline" width={18} />
                          }
                          onClick={onEditar}
                          sx={styles.acaoButton}
                        >
                          Editar projeto
                        </Button>
                      </>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        )}
      </CardWithTitle>
    </Box>
  );
};
