'use client';

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface Props {
  aberto: boolean;
  processando: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
}

export function DesvincularDialog({ aberto, processando, onFechar, onConfirmar }: Props) {
  return (
    <Dialog open={aberto} onClose={onFechar} maxWidth="xs" fullWidth>
      <DialogTitle>Desvincular Mercado Pago</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          A conta Mercado Pago da sua instituição será desconectada e os acessos guardados serão
          apagados.
        </DialogContentText>
        <Alert severity="warning">
          Enquanto estiver desvinculada, <strong>novas inscrições pagas não poderão ser
          cobradas online</strong>. Pagamentos já aprovados não são afetados.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onFechar} disabled={processando}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={onConfirmar} disabled={processando}>
          {processando ? 'Desvinculando...' : 'Desvincular'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
