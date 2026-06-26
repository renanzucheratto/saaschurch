'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { Icon as IconifyIcon } from '@iconify/react';
import { useConfirmarPresencaTokenMutation } from '@/config/redux/api/eventosApi';

type Estado = 'loading' | 'confirmado' | 'ja_confirmado' | 'erro';

function ConfirmarPresencaContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [confirmarPresenca] = useConfirmarPresencaTokenMutation();

  const [estado, setEstado] = useState<Estado>('loading');
  const [dados, setDados] = useState<{
    participanteNome: string | null;
    eventoNome: string;
    confirmadoEm: string | null;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setEstado('erro');
      return;
    }

    confirmarPresenca({ token })
      .unwrap()
      .then((res) => {
        setDados({
          participanteNome: res.participante.nome,
          eventoNome: res.evento.nome,
          confirmadoEm: res.presenca_confirmada_em,
        });
        setEstado(res.jaConfirmado ? 'ja_confirmado' : 'confirmado');
      })
      .catch(() => setEstado('erro'));
  }, [token]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#FAFAFA',
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ maxWidth: 480, width: '100%', p: 5, borderRadius: 3, textAlign: 'center' }}>
        {estado === 'loading' && (
          <>
            <CircularProgress size={56} sx={{ color: '#5B5FED', mb: 3 }} />
            <Typography variant="h6">Confirmando presença...</Typography>
          </>
        )}

        {estado === 'confirmado' && (
          <>
            <IconifyIcon icon="mdi:check-circle" width={72} color="#4CAF50" />
            <Typography variant="h5" fontWeight={700} mt={2} mb={1}>
              Presença confirmada!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={1}>
              {dados?.participanteNome && <strong>{dados.participanteNome}</strong>}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Evento: <strong>{dados?.eventoNome}</strong>
            </Typography>
            {dados?.confirmadoEm && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Confirmado em: {dados.confirmadoEm}
              </Typography>
            )}
          </>
        )}

        {estado === 'ja_confirmado' && (
          <>
            <IconifyIcon icon="mdi:check-circle-outline" width={72} color="#FF9800" />
            <Typography variant="h5" fontWeight={700} mt={2} mb={1}>
              Presença já confirmada
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={1}>
              {dados?.participanteNome && <strong>{dados.participanteNome}</strong>}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Evento: <strong>{dados?.eventoNome}</strong>
            </Typography>
            {dados?.confirmadoEm && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Confirmado em: {dados.confirmadoEm}
              </Typography>
            )}
          </>
        )}

        {estado === 'erro' && (
          <>
            <IconifyIcon icon="mdi:close-circle" width={72} color="#F44336" />
            <Typography variant="h5" fontWeight={700} mt={2} mb={1}>
              Link inválido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Este QR code não é válido ou já foi removido. Verifique o email de confirmação de inscrição.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default function ConfirmarPresencaPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={56} sx={{ color: '#5B5FED' }} />
        </Box>
      }
    >
      <ConfirmarPresencaContent />
    </Suspense>
  );
}
