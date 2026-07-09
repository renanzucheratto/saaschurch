'use client';

import { Alert, AlertTitle } from '@mui/material';
import { useBannerAssinatura } from './hooks/use-banner-assinatura';
import { useStyles } from './styles';

export function BannerAssinatura() {
  const styles = useStyles();
  const { visivel } = useBannerAssinatura();

  if (!visivel) return null;

  return (
    <Alert severity="warning" sx={styles.alerta}>
      <AlertTitle>Assinatura inativa</AlertTitle>
      A assinatura da sua instituição não está ativa. Regularize o pagamento para
      continuar usando todos os recursos.
    </Alert>
  );
}
