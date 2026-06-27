'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useListarUsuariosQuery } from '@/config/redux/api/usersApi';
import { useAdicionarMembroMutation } from '@/config/redux/api/areasApi';
import { RoleNaArea } from '@/types/area.types';

interface Props {
  areaId: string;
  open: boolean;
  onClose: () => void;
  isBackoffice: boolean;
  podeGerenciar: boolean;
}

export function AdicionarMembroDialog({ areaId, open, onClose, isBackoffice, podeGerenciar }: Props) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleNaArea, setRoleNaArea] = useState<RoleNaArea>('membro');

  const { data: usuarios = [] } = useListarUsuariosQuery();
  const [adicionarMembro, { isLoading, error }] = useAdicionarMembroMutation();

  const handleSubmit = async () => {
    if (!selectedUserId) return;
    try {
      await adicionarMembro({ areaId, userId: selectedUserId, roleNaArea }).unwrap();
      setSelectedUserId(null);
      setRoleNaArea('membro');
      onClose();
    } catch {}
  };

  const handleClose = () => {
    setSelectedUserId(null);
    setRoleNaArea('membro');
    onClose();
  };

  const usuarioSelecionado = usuarios.find((u) => u.id === selectedUserId) ?? null;

  const handleUsuarioChange = (usuario: (typeof usuarios)[number] | null) => {
    setSelectedUserId(usuario?.id ?? null);
    if (usuario) {
      setRoleNaArea(usuario.userType === 'lider' ? 'lider' : 'membro');
    } else {
      setRoleNaArea('membro');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Adicionar Integrante
        <IconButton onClick={handleClose}>
          <Icon icon="material-symbols:close" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error">
              {(error as any)?.data?.error || 'Erro ao adicionar integrante'}
            </Alert>
          )}
          <Autocomplete
            options={usuarios}
            getOptionLabel={(u) => `${u.nome} (${u.email})`}
            value={usuarioSelecionado}
            onChange={(_, newValue) => handleUsuarioChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Selecionar usuário" fullWidth />
            )}
          />
          {podeGerenciar && (
            <TextField
              label="Papel na área"
              select
              value={roleNaArea}
              onChange={(e) => setRoleNaArea(e.target.value as RoleNaArea)}
              fullWidth
            >
              <MenuItem value="lider">Líder</MenuItem>
              <MenuItem value="membro">Membro</MenuItem>
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedUserId || isLoading}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
