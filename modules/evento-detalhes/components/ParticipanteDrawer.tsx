import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Button,
  CircularProgress,
} from '@mui/material';
import { Icon as IconifyIcon } from '@iconify/react';
import { Participante } from '@/types/evento.types';
import { useEditarParticipanteMutation } from '@/config/redux/api/eventosApi';
import DeleteParticipanteModal from './DeleteParticipanteModal';
import EditParticipanteModal from './EditParticipanteModal';

interface ParticipanteDrawerProps {
  open: boolean;
  onClose: () => void;
  participante: Participante | null;
  eventoId: string;
}

export default function ParticipanteDrawer({ open, onClose, participante, eventoId }: ParticipanteDrawerProps) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editarParticipante, { isLoading: isRestoring }] = useEditarParticipanteMutation();

  if (!participante) return null;

  const handleSuccessDelete = () => {
    // Fecha o modal de delete e o drawer após a exclusão lógica
    setOpenDeleteModal(false);
    onClose();
  };

  const handleRestore = async () => {
    try {
      await editarParticipante({
        eventoId,
        participanteId: participante.id,
        data: { isDeleted: false },
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Erro ao restaurar participante:', error);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, p: 3 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            Detalhes do Participante {participante.isDeleted && <span style={{ color: 'red' }}>(Inativo)</span>}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <IconifyIcon icon="mdi:close" width={24} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3} sx={{ flexGrow: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Nome</Typography>
            <Typography variant="body1">{participante.nome}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>E-mail</Typography>
            <Typography variant="body1">{participante.email}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Telefone</Typography>
            <Typography variant="body1">{participante.telefone}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>CPF</Typography>
            <Typography variant="body1">{participante.cpf}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>RG</Typography>
            <Typography variant="body1">{participante.rg}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Termo Assinado</Typography>
            <Typography variant="body1">{participante.termo_assinado ? 'Sim' : 'Não'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Produtos Adquiridos</Typography>
            <Stack spacing={1} mt={1}>
              {participante.produtos.map((p) => (
                <Typography key={p.id} variant="body2" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {p.nome} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ mt: 4, pt: 2, display: 'flex', gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setOpenEditModal(true)}
            disabled={isRestoring}
          >
            Editar
          </Button>
          {!participante.isDeleted ? (
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => setOpenDeleteModal(true)}
              disabled={isRestoring}
            >
              Excluir
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleRestore}
              disabled={isRestoring}
              startIcon={isRestoring ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isRestoring ? 'Restaurando...' : 'Restaurar'}
            </Button>
          )}
        </Box>
      </Drawer>

      <DeleteParticipanteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        participanteId={participante.id}
        participanteNome={participante.nome}
        eventoId={eventoId}
        onSuccess={handleSuccessDelete}
      />

      <EditParticipanteModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        participante={participante}
        eventoId={eventoId}
      />
    </>
  );
}
