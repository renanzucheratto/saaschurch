'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Icon as IconifyIcon } from '@iconify/react';
import { useInitPointCopiavel } from './hooks/use-init-point-copiavel';
import { useStyles } from './styles';
import type { InitPointCopiavelProps } from '../../types';

export function InitPointCopiavel(props: InitPointCopiavelProps) {
  const styles = useStyles();
  const { copiado, copiar } = useInitPointCopiavel(props);

  return (
    <Box sx={styles.container}>
      <Typography sx={styles.link}>{props.initPoint}</Typography>
      <Tooltip title={copiado ? 'Copiado!' : 'Copiar link'}>
        <IconButton size="small" onClick={copiar}>
          <IconifyIcon
            icon={copiado ? 'material-symbols:check' : 'material-symbols:content-copy-outline'}
            width={18}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
