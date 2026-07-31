'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

type StatusPagamento = 'sucesso' | 'pendente' | 'falha';

const CONTEUDO: Record<
  StatusPagamento,
  { icone: string; cor: string; titulo: string; descricao: string }
> = {
  sucesso: {
    icone: 'material-symbols:check-circle-outline',
    cor: 'success.main',
    titulo: 'Pagamento aprovado',
    descricao:
      'Sua inscrição está confirmada. Você receberá os detalhes por e-mail. Pode fechar esta página.',
  },
  pendente: {
    icone: 'material-symbols:hourglass-top-outline',
    cor: 'warning.main',
    titulo: 'Pagamento em processamento',
    descricao:
      'Recebemos seu pagamento e ele está sendo confirmado. Isso pode levar alguns minutos — no boleto ou Pix, um pouco mais. Sua inscrição é confirmada assim que o pagamento for aprovado.',
  },
  falha: {
    icone: 'material-symbols:cancel-outline',
    cor: 'error.main',
    titulo: 'Pagamento não concluído',
    descricao:
      'O pagamento não foi aprovado. Sua inscrição continua registrada como pendente — procure a organização do evento para tentar novamente.',
  },
};

function ResultadoPagamento() {
  const searchParams = useSearchParams();
  const status = (searchParams.get('status') ?? 'pendente') as StatusPagamento;
  const conteudo = CONTEUDO[status] ?? CONTEUDO.pendente;

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
      <Card variant="outlined" sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Icon icon={conteudo.icone} width={64} />
            <Typography variant="h5" fontWeight={600} sx={{ color: conteudo.cor }}>
              {conteudo.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {conteudo.descricao}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
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
      <ResultadoPagamento />
    </Suspense>
  );
}
