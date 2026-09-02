"use client";

import {
  Box,
  Divider,
  Step,
  StepButton,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { CardWithTitle } from "@/components/card-with-title";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import { useCriarProjetoStyles } from "../styles";
import type { EtapaCriarProjeto } from "../types";

interface Props {
  etapas: EtapaCriarProjeto[];
  etapaAtual: number;
  etapasConcluidas: number[];
  etapaTemErro: (indice: number) => boolean;
  onSelecionarEtapa: (indice: number) => void;
  total: number;
}

export const StepperCriacao = ({
  etapas,
  etapaAtual,
  etapasConcluidas,
  etapaTemErro,
  onSelecionarEtapa,
  total,
}: Props) => {
  const styles = useCriarProjetoStyles();

  return (
    <Box sx={styles.painelLateral}>
      <CardWithTitle
        title={
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Etapas do cadastro
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha uma etapa por vez
            </Typography>
          </>
        }
      >
        <Stepper nonLinear activeStep={etapaAtual} orientation="vertical" sx={styles.stepper}>
          {etapas.map((etapa, indice) => {
            const concluida = etapasConcluidas.includes(indice) && indice !== etapaAtual;
            const liberada = indice <= etapaAtual || etapasConcluidas.includes(indice - 1);

            return (
              <Step key={etapa.id} completed={concluida}>
                <StepButton
                  disabled={!liberada}
                  onClick={() => onSelecionarEtapa(indice)}
                  sx={styles.stepButton}
                >
                  <StepLabel error={etapaTemErro(indice)} optional={
                    concluida ? (
                      <Typography variant="caption" color="success.main">
                        Preenchido
                      </Typography>
                    ) : undefined
                  }>
                    {etapa.titulo}
                  </StepLabel>
                </StepButton>
                <StepContent>
                  <Typography variant="caption" color="text.secondary">
                    {etapa.descricao}
                  </Typography>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>

        <Divider sx={{ my: 2 }} />

        <Box sx={styles.totalBox}>
          <Typography variant="caption" color="text.secondary">
            Total planejado
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatNumberToCurrency(total)}
          </Typography>
        </Box>
      </CardWithTitle>
    </Box>
  );
};
