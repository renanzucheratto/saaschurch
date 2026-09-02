"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";
import { Icon as IconifyIcon } from "@iconify/react";
import { CardWithTitle } from "@/components/card-with-title";
import { useProjetos } from "./hooks/use-projetos";
import { ResumoProjetosCards } from "./components/resumo-projetos";
import { FiltroStatus } from "./components/filtro-status";
import { useProjetosStyles } from "./styles";

export default function ProjetosModule() {
  const styles = useProjetosStyles();
  const {
    projetos,
    isLoading,
    resumo,
    colunas,
    statusFiltro,
    setStatusFiltro,
    podeCriar,
    irParaProjeto,
    irParaCriar,
  } = useProjetos();

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={styles.titulo}>
          Projetos
        </Typography>
        {podeCriar && (
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="material-symbols:add" width={18} />}
            onClick={irParaCriar}
            sx={styles.novoProjetoButton}
          >
            Novo projeto
          </Button>
        )}
      </Stack>

      <ResumoProjetosCards resumo={resumo} isLoading={isLoading} />

      <CardWithTitle title="Lista de projetos">
        <Box sx={{ mb: 2 }}>
          <FiltroStatus selecionados={statusFiltro} onChange={setStatusFiltro} />
        </Box>

        <DataGrid
          rows={projetos}
          columns={colunas}
          loading={isLoading}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          onRowClick={irParaProjeto}
          autoHeight
          density="standard"
          sx={styles.dataGrid}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </CardWithTitle>
    </Box>
  );
}
