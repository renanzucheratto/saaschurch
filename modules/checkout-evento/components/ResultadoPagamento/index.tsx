'use client';

import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { useResultadoPagamento } from './hooks/use-resultado-pagamento';
import { useStyles } from './styles';
import type { ResultadoPagamentoProps } from '../../types';

export function ResultadoPagamento(props: ResultadoPagamentoProps) {
  const styles = useStyles();
  const { recusado, severidade, titulo, mensagem } = useResultadoPagamento(props);

  return (
    <Box sx={styles.container}>
      <Alert severity={severidade}>
        <AlertTitle>{titulo}</AlertTitle>
        {mensagem}
      </Alert>

      {recusado && (
        <Button variant="contained" onClick={props.onTentarNovamente}>
          Tentar novamente
        </Button>
      )}
    </Box>
  );
}
