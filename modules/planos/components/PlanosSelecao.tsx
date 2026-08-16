'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import {
  useAtualizarPlanoMutation,
  useListarPlanosDisponiveisQuery,
  usePlanoAtualQuery,
} from '@/config/redux/api/planosApi';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { PlanoDisponivel } from '@/types/plano.types';
import { PlanoCard } from './PlanoCard';
import { ResumoSplit } from './ResumoSplit';

export function PlanosSelecao() {
  const { is } = usePermissions();
  const podeSelecionar = is('backoffice');

  const {
    data,
    isLoading,
    error,
  } = useListarPlanosDisponiveisQuery();

  const { data: planoAtual } = usePlanoAtualQuery();
  const [atualizarPlano, { isLoading: salvando }] = useAtualizarPlanoMutation();

  const [confirmando, setConfirmando] = useState<PlanoDisponivel | null>(null);
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const handleConfirmar = async () => {
    if (!confirmando) return;

    try {
      const resultado = await atualizarPlano({ planoId: confirmando.id }).unwrap();
      setAviso({ tipo: 'success', texto: resultado.message });
    } catch (err: any) {
      setAviso({
        tipo: 'error',
        texto: err?.data?.error ?? 'Não foi possível alterar o plano.',
      });
    } finally {
      setConfirmando(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Não foi possível carregar os planos.</Alert>;
  }

  const planos = data?.planos ?? [];

  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Planos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Escolha o plano da sua instituição. A plataforma é remunerada por uma taxa sobre as
          inscrições pagas online — não há mensalidade no plano gratuito.
        </Typography>
      </Stack>

      {!podeSelecionar && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Você pode visualizar os planos, mas apenas usuários backoffice podem alterá-lo.
        </Alert>
      )}

      {planoAtual?.split && <ResumoSplit split={planoAtual.split} sx={{ mb: 3 }} />}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
        }}
      >
        {planos.map((plano) => (
          <PlanoCard
            key={plano.id}
            plano={plano}
            selecionando={salvando && confirmando?.id === plano.id}
            podeSelecionar={podeSelecionar}
            onSelecionar={() => setConfirmando(plano)}
          />
        ))}
      </Box>

      {planos.length === 0 && (
        <Alert severity="warning">Nenhum plano disponível no momento.</Alert>
      )}

      <Dialog open={!!confirmando} onClose={() => setConfirmando(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Alterar plano</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ativar o plano <strong>{confirmando?.nome}</strong> para a sua instituição?
          </DialogContentText>
          {confirmando && (
            <DialogContentText sx={{ mt: 2 }} component="div">
              A taxa por inscrição paga passa a ser{' '}
              <strong>
                {Number(confirmando.feeEventoPercentual).toLocaleString('pt-BR', {
                  maximumFractionDigits: 2,
                })}
                %
              </strong>
              .
              {/* Overrides negociados vencem o padrão do plano — avisar para a
                  troca não parecer que mudou a taxa quando não mudou. */}
              {planoAtual?.split.origem.percentual === 'instituicao' && (
                <Box component="span" sx={{ display: 'block', mt: 1 }}>
                  Sua instituição tem uma taxa negociada específica, que continua valendo sobre o
                  padrão do plano.
                </Box>
              )}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmando(null)} disabled={salvando}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleConfirmar} disabled={salvando}>
            {salvando ? 'Ativando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!aviso}
        autoHideDuration={5000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={aviso?.tipo ?? 'info'} onClose={() => setAviso(null)}>
          {aviso?.texto}
        </Alert>
      </Snackbar>
    </Box>
  );
}
