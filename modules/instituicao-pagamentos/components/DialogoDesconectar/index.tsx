'use client';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useDialogoDesconectar } from './hooks/use-dialogo-desconectar';
import { useStyles } from './styles';
import type { DialogoDesconectarProps } from '../../types';

export function DialogoDesconectar(props: DialogoDesconectarProps) {
  const styles = useStyles();
  const { aviso, ressalva } = useDialogoDesconectar(props);

  const { aberto, desconectando, onFechar, onConfirmar } = props;

  return (
    <Dialog open={aberto} onClose={onFechar} fullWidth maxWidth="sm">
      <DialogTitle>Desconectar o Mercado Pago</DialogTitle>

      <DialogContent>
        <Box sx={styles.conteudo}>
          <Alert severity="warning">{aviso}</Alert>
          <DialogContentText>{ressalva}</DialogContentText>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onFechar}>Voltar</Button>
        <Button color="error" onClick={onConfirmar} disabled={desconectando}>
          Desconectar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
