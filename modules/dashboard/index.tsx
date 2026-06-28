"use client";

import { Box, Grid, Typography } from "@mui/material";
import { useObterDashboardStatsQuery } from "@/config/redux/api/dashboardApi";
import { StatCards } from "./components/StatCards";
import { MembrosGrowthChart } from "./components/MembrosGrowthChart";
import { EventosPorMesChart } from "./components/EventosPorMesChart";
import { ParticipacaoEventoChart } from "./components/ParticipacaoEventoChart";
import { MembrosPorAreaChart } from "./components/MembrosPorAreaChart";
import { ProjetosPorStatusChart } from "./components/ProjetosPorStatusChart";
import { ProximosEventos } from "./components/ProximosEventos";
import { UltimosMembros } from "./components/UltimosMembros";

export const Dashboard = () => {
  const { data, isLoading } = useObterDashboardStatsQuery();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" fontWeight={700}>
        Dashboard
      </Typography>

      <StatCards cards={data?.cards} isLoading={isLoading} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MembrosGrowthChart data={data?.crescimentoMembros} isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MembrosPorAreaChart data={data?.membrosPorArea} isLoading={isLoading} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <EventosPorMesChart data={data?.eventosPorMes} isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <ParticipacaoEventoChart data={data?.participacaoPorEvento} isLoading={isLoading} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <ProjetosPorStatusChart data={data?.projetosPorStatus} isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ProximosEventos data={data?.proximosEventos} isLoading={isLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <UltimosMembros data={data?.ultimosMembros} isLoading={isLoading} />
        </Grid>
      </Grid>
    </Box>
  );
};
