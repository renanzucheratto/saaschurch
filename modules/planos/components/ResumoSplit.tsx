'use client';

import { Box, Chip, Paper, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import { Icon } from '@iconify/react';
import { BORDER_RADIUS } from '@/config/utils/contants';
import type { RegraSplit } from '@/types/plano.types';

interface Props {
  split: RegraSplit;
  sx?: SxProps<Theme>;
}

function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ResumoSplit({ split, sx }: Props) {
  const temNegociado =
    split.origem.percentual === 'instituicao' ||
    split.origem.minimo === 'instituicao' ||
    split.origem.maximo === 'instituicao';

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: BORDER_RADIUS, ...sx }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Icon icon="material-symbols:receipt-long-outline" width={20} />
        <Typography variant="subtitle2" fontWeight={600}>
          Taxa aplicada hoje
        </Typography>
        {temNegociado && <Chip size="small" color="info" label="Condição negociada" />}
      </Stack>

      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2">
            <strong>
              {split.percentual.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%
            </strong>{' '}
            por inscrição paga
          </Typography>
          {split.origem.percentual === 'instituicao' && (
            <Chip size="small" variant="outlined" label="específica da instituição" />
          )}
        </Stack>

        {split.minimo > 0 && (
          <Typography variant="body2" color="text.secondary">
            Mínimo de {moeda(split.minimo)} por transação
          </Typography>
        )}

        {split.maximo !== null && (
          <Typography variant="body2" color="text.secondary">
            Máximo de {moeda(split.maximo)} por transação
          </Typography>
        )}
      </Stack>

      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          A taxa incide apenas sobre pagamentos feitos online pelo PagBank. Lançamentos
          registrados manualmente não são afetados.
        </Typography>
      </Box>
    </Paper>
  );
}
