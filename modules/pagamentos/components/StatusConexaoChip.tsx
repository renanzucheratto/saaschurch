'use client';

import { Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import type { PagBankAccountStatus } from '@/types/pagbank.types';

interface Props {
  status?: PagBankAccountStatus;
  conectado: boolean;
}

const CONFIG: Record<
  PagBankAccountStatus,
  { label: string; color: 'success' | 'warning' | 'default' | 'info'; icon: string }
> = {
  ACTIVE: { label: 'Conectado', color: 'success', icon: 'material-symbols:check-circle-outline' },
  EXPIRED: { label: 'Acesso expirado', color: 'warning', icon: 'material-symbols:error-outline' },
  REVOKED: { label: 'Desvinculado', color: 'default', icon: 'material-symbols:link-off' },
  PENDING: { label: 'Conexão incompleta', color: 'info', icon: 'material-symbols:hourglass-empty' },
};

export function StatusConexaoChip({ status, conectado }: Props) {
  if (!status) {
    return (
      <Chip
        size="small"
        label="Não conectado"
        icon={<Icon icon="material-symbols:link-off" width={16} />}
      />
    );
  }

  const cfg = CONFIG[status];

  return (
    <Chip
      size="small"
      color={cfg.color}
      label={cfg.label}
      icon={<Icon icon={cfg.icon} width={16} />}
      variant={conectado ? 'filled' : 'outlined'}
    />
  );
}
