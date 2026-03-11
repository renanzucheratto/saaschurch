import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useEditarParticipanteMutation } from '@/config/redux/api/eventosApi';
import { Participante } from '@/types/evento.types';

interface EditParticipanteModalProps {
  open: boolean;
  onClose: () => void;
  participante: Participante | null;
  eventoId: string;
}

export default function EditParticipanteModal({
  open,
  onClose,
  participante,
  eventoId,
}: EditParticipanteModalProps) {
  const [editarParticipante, { isLoading }] = useEditarParticipanteMutation();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    rg: '',
    cpf: '',
    termo_assinado: false,
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (participante && open) {
      setFormData({
        nome: participante.nome || '',
        email: participante.email || '',
        telefone: participante.telefone || '',
        rg: participante.rg || '',
        cpf: participante.cpf || '',
        termo_assinado: participante.termo_assinado || false,
      });
    }
  }, [participante, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participante) return;
    
    try {
      await editarParticipante({
        eventoId,
        participanteId: participante.id,
        data: formData,
      }).unwrap();
      
      setSnackbar({ open: true, message: 'Participante atualizado com sucesso!', severity: 'success' });
      onClose();
    } catch (error: any) {
      console.error('Erro ao editar participante:', error);
      const errorMessage = error?.data?.error || 'Erro ao editar participante. Tente novamente.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (!participante) return null;

  return (
    <>
      <Dialog open={open} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Editar Participante</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="RG"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                fullWidth
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="termo_assinado"
                    checked={formData.termo_assinado}
                    onChange={handleChange}
                  />
                }
                label="Termo Assinado"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
