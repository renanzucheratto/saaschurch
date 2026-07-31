'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ConexaoMercadoPago } from '@/modules/pagamentos/components/ConexaoMercadoPago';

export default function PagamentosPage() {
  return (
    // useSearchParams exige Suspense no App Router, senão a página inteira
    // cai para renderização dinâmica no build.
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      }
    >
      <ConexaoMercadoPago />
    </Suspense>
  );
}
