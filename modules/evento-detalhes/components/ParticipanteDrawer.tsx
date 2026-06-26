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
  Chip,
} from '@mui/material';
import { Icon as IconifyIcon } from '@iconify/react';
import { Participante, Produto, CampoCustomizado } from '@/types/evento.types';
import { useEditarParticipanteMutation, useConfirmarPresencaManualMutation } from '@/config/redux/api/eventosApi';
import DeleteParticipanteModal from './DeleteParticipanteModal';
import EditParticipanteModal from './EditParticipanteModal';
import GerenciarPagamento from './GerenciarPagamento';

interface ParticipanteDrawerProps {
  open: boolean;
  onClose: () => void;
  participante: Participante | null;
  eventoId: string;
  produtos: Produto[];
  campos?: CampoCustomizado[];
}

export default function ParticipanteDrawer({ open, onClose, participante, eventoId, produtos, campos = [] }: ParticipanteDrawerProps) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editarParticipante, { isLoading: isRestoring }] = useEditarParticipanteMutation();
  const [confirmarPresenca, { isLoading: isConfirmando }] = useConfirmarPresencaManualMutation();

  if (!participante) return null;

  const temCamposCustomizados = campos.length > 0;

  const getRespostaTexto = (campo: CampoCustomizado): string => {
    const resposta = participante.respostas_customizadas?.find((r) => r.campoId === campo.id);
    if (!resposta) return '—';
    if (resposta.valores && resposta.valores.length > 0) return resposta.valores.join(', ');
    return resposta.valor || '—';
  };

  const handleConfirmarPresenca = async () => {
    try {
      await confirmarPresenca({ eventoId, participanteId: participante.id }).unwrap();
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
    }
  };

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
          sx: { width: { xs: '100%', sm: 650 }, p: 3 },
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
          {temCamposCustomizados ? (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Data de inscrição</Typography>
                <Typography variant="body1">
                  {participante.createdAt ? new Date(participante.createdAt).toLocaleString('pt-BR') : '—'}
                </Typography>
              </Box>
              {campos.map((campo) => (
                <Box key={campo.id}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {campo.label}{campo.oculto ? ' (oculto)' : ''}
                  </Typography>
                  <Typography variant="body1">{getRespostaTexto(campo)}</Typography>
                </Box>
              ))}
            </>
          ) : (
            <>
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
            </>
          )}
          {participante.produtos && participante.produtos.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Produtos Adquiridos</Typography>
              <Stack spacing={1} mt={1}>
                {participante.produtos.map((p) => (
                  <GerenciarPagamento key={p.id} eventoId={eventoId} participanteId={participante.id} produto={p} />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>

        {!participante.isDeleted && (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: participante.presenca_confirmada ? '#E8F5E9' : '#F5F5F5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Presença
                </Typography>
                {participante.presenca_confirmada ? (
                  <>
                    <Chip
                      label="Confirmada"
                      color="success"
                      size="small"
                      icon={<IconifyIcon icon="mdi:check-circle" width={16} />}
                      sx={{ mt: 0.5 }}
                    />
                    {participante.presenca_confirmada_em && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        {new Date(participante.presenca_confirmada_em).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Chip label="Pendente" size="small" sx={{ mt: 0.5, bgcolor: '#E0E0E0' }} />
                )}
              </Box>
              {!participante.presenca_confirmada && (
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={handleConfirmarPresenca}
                  disabled={isConfirmando}
                  startIcon={isConfirmando ? <CircularProgress size={14} color="inherit" /> : <IconifyIcon icon="mdi:check" width={16} />}
                >
                  {isConfirmando ? 'Confirmando...' : 'Confirmar Presença'}
                </Button>
              )}
            </Box>
          </Box>
        )}

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
        participanteNome={participante.nome || 'Participante'}
        eventoId={eventoId}
        onSuccess={handleSuccessDelete}
      />

      <EditParticipanteModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        participante={participante}
        eventoId={eventoId}
        produtos={produtos}
        campos={campos}
      />
    </>
  );
}
