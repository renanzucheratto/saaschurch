'use client';

import { Chip } from '@mui/material';
import { usePlanoBadge } from './hooks/use-plano-badge';
import { useStyles } from './styles';
import type { PlanoBadgeProps } from './types';

export function PlanoBadge(props: PlanoBadgeProps) {
  const styles = useStyles();
  const { gratuito, rotulo, visivel } = usePlanoBadge(props);

  if (!visivel) return null;

  return <Chip label={rotulo} size={props.size ?? 'small'} sx={styles.chip(gratuito)} />;
}
