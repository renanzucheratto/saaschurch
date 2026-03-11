import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useExcluirParticipanteMutation } from '@/config/redux/api/eventosApi';

interface DeleteParticipanteModalProps {
  open: boolean;
  onClose: () => void;
  participanteId: string;
  participanteNome: string;
  eventoId: string;
  onSuccess: () => void;
}

export default function DeleteParticipanteModal({
  open,
  onClose,
  participanteId,
  participanteNome,
  eventoId,
  onSuccess,
}: DeleteParticipanteModalProps) {
  const [excluirParticipante, { isLoading }] = useExcluirParticipanteMutation();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDelete = async () => {
    try {
      await excluirParticipante({ eventoId, participanteId }).unwrap();
      setSnackbar({ open: true, message: 'Participante excluído com sucesso!', severity: 'success' });
      // Pequeno delay para a pessoa ver o sucesso (opcional) ou não fechar instantâneo.
      // Como o Drawer vai fechar no onSuccess, o Snackbar pode ser cortado se estiver dentro do Modal, 
      // mas vamos deixar rodar o onSuccess e onClose simultaneamente.
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir participante:', error);
      setSnackbar({ open: true, message: 'Erro ao excluir participante. Tente novamente.', severity: 'error' });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={!isLoading ? onClose : undefined} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Excluir Participante</DialogTitle>
        <DialogContent>
          <Typography>
            Você está deletando "{participanteNome}" do evento. Quer prosseguir com essa ação?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            variant="outlined" 
            color="info" 
            onClick={onClose} 
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
