'use client';

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useAppSelector } from '@/config/redux/store';
import { selectCurrentUser } from '@/config/redux/slices/authSlice';
import { useBuscarAreaQuery, useAtualizarAreaMutation, useRemoverAreaMutation } from '@/config/redux/api/areasApi';
import { MembroRow } from './MembroRow';
import { AdicionarMembroDialog } from './AdicionarMembroDialog';

interface Props {
  areaId: string;
  onVoltar: () => void;
}

export function AreaDetalhes({ areaId, onVoltar }: Props) {
  const currentUser = useAppSelector(selectCurrentUser);
  const userType = currentUser?.userType ?? '';

  const { data: area, isLoading, error } = useBuscarAreaQuery(areaId);
  const [atualizarArea, { isLoading: salvando }] = useAtualizarAreaMutation();
  const [removerArea] = useRemoverAreaMutation();

  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [openAdicionarDialog, setOpenAdicionarDialog] = useState(false);

  const isBackoffice = userType === 'backoffice';
  const isLiderDaArea = !!area?.lideres.some((l) => l.id === currentUser?.id);
  const podeGerenciar = isBackoffice || (userType === 'lider' && isLiderDaArea);
  const podeEditar = isBackoffice || (userType === 'lider' && isLiderDaArea);

  const handleEditarNome = () => {
    setNovoNome(area?.nome ?? '');
    setEditandoNome(true);
  };

  const handleSalvarNome = async () => {
    if (!novoNome.trim()) return;
    try {
      await atualizarArea({ id: areaId, nome: novoNome }).unwrap();
      setEditandoNome(false);
    } catch {}
  };

  const handleRemoverArea = async () => {
    if (!confirm(`Remover a área "${area?.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await removerArea(areaId).unwrap();
      onVoltar();
    } catch {}
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !area) {
    return <Alert severity="error">Área não encontrada.</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" gap={1} mb={3}>
        <Tooltip title="Voltar">
          <IconButton onClick={onVoltar} size="small">
            <Icon icon="material-symbols:arrow-back" />
          </IconButton>
        </Tooltip>

        {editandoNome ? (
          <Stack direction="row" alignItems="center" gap={1} flex={1}>
            <TextField
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              size="small"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSalvarNome();
                if (e.key === 'Escape') setEditandoNome(false);
              }}
              sx={{ flex: 1, maxWidth: 300 }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={handleSalvarNome}
              disabled={salvando}
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            >
              {salvando ? <CircularProgress size={16} color="inherit" /> : 'Salvar'}
            </Button>
            <Button size="small" onClick={() => setEditandoNome(false)}>
              Cancelar
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" gap={1} flex={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {area.nome}
            </Typography>
            {podeEditar && (
              <Tooltip title="Editar nome">
                <IconButton size="small" onClick={handleEditarNome}>
                  <Icon icon="material-symbols:edit-outline" width={18} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}

        <Stack direction="row" gap={1}>
          {podeGerenciar && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Icon icon="material-symbols:person-add-outline" />}
              onClick={() => setOpenAdicionarDialog(true)}
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            >
              Adicionar Pessoa
            </Button>
          )}
          {podeEditar && (
            <Tooltip title="Remover área">
              <IconButton size="small" onClick={handleRemoverArea} sx={{ color: '#d32f2f' }}>
                <Icon icon="material-symbols:delete-outline" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Líderes */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: '#999', letterSpacing: 0.5, px: 1.5, display: 'block', mb: 1 }}
        >
          LÍDERES ({area.lideres.length})
        </Typography>
        {area.lideres.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1.5 }}>
            Nenhum líder adicionado ainda.
          </Typography>
        ) : (
          area.lideres.map((l) => (
            <MembroRow
              key={l.id}
              areaId={areaId}
              membro={l}
              roleNaArea="lider"
              podeGerenciar={podeGerenciar}
              userType={userType}
            />
          ))
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Membros */}
      <Box>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: '#999', letterSpacing: 0.5, px: 1.5, display: 'block', mb: 1 }}
        >
          MEMBROS ({area.membros.length})
        </Typography>
        {area.membros.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1.5 }}>
            Nenhum membro adicionado ainda.
          </Typography>
        ) : (
          area.membros.map((m) => (
            <MembroRow
              key={m.id}
              areaId={areaId}
              membro={m}
              roleNaArea="membro"
              podeGerenciar={podeGerenciar}
              userType={userType}
            />
          ))
        )}
      </Box>

      <AdicionarMembroDialog
        areaId={areaId}
        open={openAdicionarDialog}
        onClose={() => setOpenAdicionarDialog(false)}
        isBackoffice={isBackoffice}
        podeGerenciar={podeGerenciar}
      />
    </Box>
  );
}
