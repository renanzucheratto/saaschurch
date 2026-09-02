"use client";

import { Grid } from "@mui/material";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import { BigNumberCard } from "./big-number-card";
import { GraficoLinhaMensal } from "./grafico-linha-mensal";
import { GraficoStatus } from "./grafico-status";
import type { ResumoProjetos } from "../types";

interface Props {
  resumo: ResumoProjetos;
  isLoading: boolean;
}

export const ResumoProjetosCards = ({ resumo, isLoading }: Props) => (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <BigNumberCard
        label="Total planejado"
        valor={formatNumberToCurrency(resumo.totalPlanejado)}
        descricao={`${resumo.qtdAtivos} projeto(s) · ${resumo.qtdEmAndamento} em andamento`}
        icone="solar:wallet-money-bold-duotone"
        cor="#7b57df"
        fundo="rgba(123,87,223,0.12)"
        isLoading={isLoading}
      >
        {!isLoading && (
          <GraficoLinhaMensal
            pontos={resumo.serieMensal}
            campo="totalPlanejado"
            cor="#7b57df"
          />
        )}
      </BigNumberCard>
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <BigNumberCard
        label="A reembolsar"
        valor={formatNumberToCurrency(resumo.aguardandoReembolso)}
        descricao={`${resumo.qtdAguardando} aprovado(s) ou em reembolso`}
        icone="solar:card-transfer-bold-duotone"
        cor="#3b82f6"
        fundo="rgba(59,130,246,0.12)"
        isLoading={isLoading}
      >
        {!isLoading && (
          <GraficoLinhaMensal pontos={resumo.serieMensal} campo="aReembolsar" cor="#3b82f6" />
        )}
      </BigNumberCard>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <BigNumberCard
        label="Projetos por status"
        valor={String(resumo.totalProjetos)}
        descricao={`${formatNumberToCurrency(resumo.jaReembolsado)} já reembolsado`}
        icone="solar:chart-square-bold-duotone"
        cor="#10b981"
        fundo="rgba(16,185,129,0.12)"
        isLoading={isLoading}
      >
        {!isLoading && <GraficoStatus porStatus={resumo.porStatus} />}
      </BigNumberCard>
    </Grid>
  </Grid>
);
