'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { PagamentoCheckout } from '@/modules/pagamentos/components/PagamentoCheckout';

/**
 * Tela de pagamento do participante — NOSSA, não um redirect para o
 * provedor. O PagBank não aceita split no checkout hospedado, então quem
 * cria o pedido (Pix/cartão) e mostra QR Code/resultado é esta
 * página, chamando POST /checkout/pedidos.
 */
function ConteudoPagamento() {
  const searchParams = useSearchParams();
  const participanteId = searchParams.get('participanteId');
  const produtoId = searchParams.get('produtoId');

  if (!participanteId || !produtoId) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Stack spacing={1} textAlign="center" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Link de pagamento inválido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Volte à página de inscrição do evento e tente novamente.
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <PagamentoCheckout participanteId={participanteId} produtoId={produtoId} />
    </Box>
  );
}

export default function PagamentoRetornoPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      }
    >
      <ConteudoPagamento />
    </Suspense>
  );
}
