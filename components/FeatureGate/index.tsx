'use client';

import { Box, Skeleton, Tooltip } from '@mui/material';
import { useFeatureGate } from './hooks/use-feature-gate';
import { useStyles } from './styles';
import type { FeatureGateProps } from './types';

export function FeatureGate(props: FeatureGateProps) {
  const styles = useStyles();
  const { carregando, liberado, modo, textoTooltip } = useFeatureGate(props);

  // Skeleton durante o carregamento: renderizar o estado bloqueado aqui causaria um
  // flash de "você não pode" para quem pode.
  if (carregando) {
    return <Skeleton variant="rounded" width={140} height={36} sx={styles.skeleton} />;
  }

  if (liberado) {
    return <>{props.children}</>;
  }

  if (modo === 'desabilitar') {
    return (
      <Tooltip title={textoTooltip}>
        <Box sx={styles.envolucroTooltip}>
          <Box sx={styles.desabilitado} aria-disabled>
            {props.children}
          </Box>
        </Box>
      </Tooltip>
    );
  }

  return <>{props.fallback ?? null}</>;
}
