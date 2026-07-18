'use client';

import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { formatNumberToCurrency } from '@/config/helpers/currency-mask';
import { BORDER_RADIUS } from '@/config/utils/contants';
import type { SaldoConta } from '@/types/financeiro.types';
import { formatDataBR } from '../utils';

interface Props {
  saldo?: SaldoConta;
  isLoading: boolean;
}

interface CardInfo {
  label: string;
  valor: string;
  sublabel?: string;
  icon: string;
  cor: string;
  bg: string;
}

export function SaldoCards({ saldo, isLoading }: Props) {
  const cards: CardInfo[] = [
    {
      label: 'Saldo atual',
      valor: formatNumberToCurrency(saldo?.saldoAtual ?? 0),
      icon: 'material-symbols:account-balance-wallet-outline',
      cor: '#6366f1',
      bg: '#eef2ff',
    },
    {
      label: 'Entradas',
      valor: formatNumberToCurrency(saldo?.totalCreditos ?? 0),
      icon: 'material-symbols:trending-up',
      cor: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: 'Saídas',
      valor: formatNumberToCurrency(saldo?.totalDebitos ?? 0),
      icon: 'material-symbols:trending-down',
      cor: '#dc2626',
      bg: '#fef2f2',
    },
    {
      label: 'Saldo inicial',
      valor: formatNumberToCurrency(saldo?.saldoInicial ?? 0),
      sublabel: saldo?.dataSaldoInicial ? `desde ${formatDataBR(saldo.dataSaldoInicial)}` : undefined,
      icon: 'material-symbols:flag-outline',
      cor: '#64748b',
      bg: '#f8fafc',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.label}
          variant="outlined"
          sx={{ borderRadius: BORDER_RADIUS.medium, p: 2 }}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: card.bg,
                color: card.cor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon icon={card.icon} width={22} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {card.label}
              </Typography>
              {isLoading ? (
                <Skeleton variant="text" width={90} sx={{ fontSize: 18 }} />
              ) : (
                <Typography sx={{ fontWeight: 700, fontSize: 17, lineHeight: 1.2 }} noWrap>
                  {card.valor}
                </Typography>
              )}
              {card.sublabel && !isLoading && (
                <Typography variant="caption" color="text.secondary">
                  {card.sublabel}
                </Typography>
              )}
            </Box>
          </Stack>
        </Card>
      ))}
    </Box>
  );
}
