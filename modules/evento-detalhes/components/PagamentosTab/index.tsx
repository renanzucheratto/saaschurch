'use client';

import { Box, MenuItem, Skeleton, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { usePagamentosTab } from './hooks/use-pagamentos-tab';
import { useStyles } from './styles';
import type { PagamentosTabProps } from './types';

export function PagamentosTab(props: PagamentosTabProps) {
  const styles = useStyles();
  const {
    colunas,
    linhas,
    totais,
    opcoesStatus,
    filtroStatus,
    setFiltroStatus,
    carregando,
    vazio,
  } = usePagamentosTab(props);

  if (carregando) {
    return <Skeleton variant="rounded" height={360} sx={styles.skeleton} />;
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.totais}>
        {totais.map((total) => (
          <Box key={total.rotulo} sx={styles.cartaoTotal}>
            <Typography sx={styles.rotuloTotal}>{total.rotulo}</Typography>
            <Typography sx={styles.valorTotal}>{total.valor}</Typography>
          </Box>
        ))}
      </Box>

      <TextField
        select
        size="small"
        label="Status"
        value={filtroStatus}
        onChange={(evento) => setFiltroStatus(evento.target.value)}
        sx={styles.filtro}
        fullWidth
      >
        {opcoesStatus.map((opcao) => (
          <MenuItem key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </MenuItem>
        ))}
      </TextField>

      {vazio ? (
        <Typography color="text.secondary">
          Nenhum pagamento registrado para este evento.
        </Typography>
      ) : (
        <DataGrid
          rows={linhas}
          columns={colunas}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          sx={styles.grid}
        />
      )}
    </Box>
  );
}
