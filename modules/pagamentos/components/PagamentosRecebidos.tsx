'use client';

import { useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from '@mui/material';
import { useListarPagamentosPagBankQuery } from '@/config/redux/api/pagbankApi';
import type { PagBankPagamentoStatus } from '@/types/pagbank.types';
import { CardWithTitle } from '@/components/card-with-title';

function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS: Record<
  PagBankPagamentoStatus,
  { label: string; color: 'success' | 'warning' | 'error' | 'default' | 'info' }
> = {
  PAID: { label: 'Pago', color: 'success' },
  AUTHORIZED: { label: 'Autorizado', color: 'info' },
  IN_ANALYSIS: { label: 'Em análise', color: 'warning' },
  WAITING: { label: 'Aguardando', color: 'warning' },
  DECLINED: { label: 'Recusado', color: 'error' },
  CANCELED: { label: 'Cancelado', color: 'default' },
  REFUNDED: { label: 'Estornado', color: 'default' },
};

const METODO: Record<string, string> = {
  CREDIT_CARD: 'Crédito',
  DEBIT_CARD: 'Débito',
  PIX: 'Pix',
  BOLETO: 'Boleto',
};

export function PagamentosRecebidos() {
  const [pagina, setPagina] = useState(0);
  const [porPagina, setPorPagina] = useState(25);

  const { data, isLoading } = useListarPagamentosPagBankQuery({
    pagina: pagina + 1,
    porPagina,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pagamentos = data?.pagamentos ?? [];

  // Totais apenas do que foi efetivamente pago — somar tentativas recusadas
  // daria um número que não existe em lugar nenhum.
  const pagos = pagamentos.filter((p) => p.status === 'PAID');
  const bruto = pagos.reduce((acc, p) => acc + Number(p.valor), 0);
  const taxas = pagos.reduce((acc, p) => acc + Number(p.splitValor), 0);

  return (
    <CardWithTitle
      sx={{ mt: 3 }}
      title={
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            Pagamentos online recebidos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Valores já descontados da taxa desta plataforma. A taxa cobrada pelo próprio
            PagBank não vem nas notificações e não está incluída aqui — o valor efetivamente
            creditado sai no extrato da conta PagBank.
          </Typography>
        </Stack>
      }
    >
      {pagos.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Recebido (bruto)
            </Typography>
            <Typography variant="h6" fontWeight={600}>{moeda(bruto)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Taxas
            </Typography>
            <Typography variant="h6" fontWeight={600}>−{moeda(taxas)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Após nossa taxa
            </Typography>
            <Typography variant="h6" fontWeight={600} color="success.main">
              {moeda(bruto - taxas)}
            </Typography>
          </Box>
        </Stack>
      )}

      <Divider sx={{ mb: 1 }} />

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Método</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="right">Taxas</TableCell>
              <TableCell align="right">Após taxa</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagamentos.map((p) => {
              const valor = Number(p.valor);
              const taxa = Number(p.splitValor);
              const cfg = STATUS[p.status];

              return (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(p.aprovadoEm ?? p.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{METODO[p.metodoPagamento ?? ''] ?? p.metodoPagamento ?? '—'}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {moeda(valor)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }} >
                    {taxa > 0 ? `−${moeda(taxa)}` : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {moeda(valor - taxa)}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={cfg?.label ?? p.status} color={cfg?.color ?? 'default'} />
                  </TableCell>
                </TableRow>
              );
            })}

            {pagamentos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Nenhum pagamento online ainda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        component="div"
        count={data?.total ?? 0}
        page={pagina}
        onPageChange={(_e, nova) => setPagina(nova)}
        rowsPerPage={porPagina}
        onRowsPerPageChange={(e) => {
          setPorPagina(Number(e.target.value));
          setPagina(0);
        }}
        rowsPerPageOptions={[25, 50, 100]}
        labelRowsPerPage="Por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
    </CardWithTitle>
  );
}
