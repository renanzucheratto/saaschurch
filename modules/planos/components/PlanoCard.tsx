'use client';

import { Box, Button, Card, CardContent, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { BORDER_RADIUS } from '@/config/utils/contants';
import type { PlanoDisponivel } from '@/types/plano.types';

interface Props {
  plano: PlanoDisponivel;
  selecionando: boolean;
  podeSelecionar: boolean;
  onSelecionar: (planoId: string) => void;
}

function formatarMoeda(valor: string | number | null): string {
  if (valor === null) return '—';
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarPercentual(valor: string | number): string {
  // Number() antes de formatar: o Decimal do Prisma chega como string com
  // 30 casas decimais ("3.500000000000000000000000000000").
  return `${Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
}

export function PlanoCard({ plano, selecionando, podeSelecionar, onSelecionar }: Props) {
  const gratuito = Number(plano.valorMensal) === 0;
  const acessoTotal = plano.features?.acessoTotal === true;

  const botaoDesabilitado = plano.atual || !plano.selecionavel || !podeSelecionar || selecionando;

  const textoBotao = plano.atual
    ? 'Plano atual'
    : !plano.selecionavel
      ? 'Indisponível'
      : selecionando
        ? 'Ativando...'
        : 'Selecionar plano';

  const motivoBloqueio = !plano.selecionavel
    ? plano.motivoIndisponivel
    : !podeSelecionar
      ? 'Apenas usuários backoffice podem alterar o plano.'
      : null;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: BORDER_RADIUS,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: plano.atual ? 'primary.main' : undefined,
        borderWidth: plano.atual ? 2 : 1,
        opacity: plano.selecionavel || plano.atual ? 1 : 0.7,
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="h6" fontWeight={600}>
            {plano.nome}
          </Typography>
          {plano.atual && <Chip size="small" color="primary" label="Atual" />}
        </Stack>

        <Box>
          <Typography variant="h4" fontWeight={700} component="span">
            {gratuito ? 'Grátis' : formatarMoeda(plano.valorMensal)}
          </Typography>
          {!gratuito && (
            <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 0.5 }}>
              /mês
            </Typography>
          )}
        </Box>

        {plano.descricao && (
          <Typography variant="body2" color="text.secondary">
            {plano.descricao}
          </Typography>
        )}

        <Divider />

        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Icon icon="material-symbols:percent" width={18} />
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {formatarPercentual(plano.feeEventoPercentual)} por inscrição paga
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Descontado automaticamente. Só incide sobre pagamentos online.
              </Typography>
            </Box>
          </Stack>

          {Number(plano.feeEventoMinimo) > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon icon="material-symbols:arrow-downward" width={18} />
              <Typography variant="body2">
                Mínimo de {formatarMoeda(plano.feeEventoMinimo)} por transação
              </Typography>
            </Stack>
          )}

          {plano.feeEventoMaximo !== null && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon icon="material-symbols:arrow-upward" width={18} />
              <Typography variant="body2">
                Máximo de {formatarMoeda(plano.feeEventoMaximo)} por transação
              </Typography>
            </Stack>
          )}

          <Stack direction="row" spacing={1} alignItems="center">
            <Icon icon="material-symbols:event-outline" width={18} />
            <Typography variant="body2">
              {plano.limiteEventosAtivos === null
                ? 'Eventos ativos ilimitados'
                : `Até ${plano.limiteEventosAtivos} eventos ativos`}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Icon icon="material-symbols:group-outline" width={18} />
            <Typography variant="body2">
              {plano.limiteUsuarios === null
                ? 'Usuários ilimitados'
                : `Até ${plano.limiteUsuarios} usuários`}
            </Typography>
          </Stack>

          {acessoTotal && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon icon="material-symbols:check-circle-outline" width={18} />
              <Typography variant="body2">Acesso a todos os recursos</Typography>
            </Stack>
          )}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={motivoBloqueio ?? ''} disableHoverListener={!motivoBloqueio}>
          {/* span necessário: Tooltip não dispara em elemento desabilitado */}
          <span>
            <Button
              fullWidth
              variant={plano.atual ? 'outlined' : 'contained'}
              disabled={botaoDesabilitado}
              onClick={() => onSelecionar(plano.id)}
            >
              {textoBotao}
            </Button>
          </span>
        </Tooltip>
      </CardContent>
    </Card>
  );
}
