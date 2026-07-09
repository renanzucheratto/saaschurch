import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  skeleton: {
    borderRadius: 1,
  } satisfies SxProps<Theme>,

  desabilitado: {
    display: 'inline-flex',
    opacity: 0.5,
    pointerEvents: 'none',
    cursor: 'not-allowed',
  } satisfies SxProps<Theme>,

  envolucroTooltip: {
    display: 'inline-flex',
  } satisfies SxProps<Theme>,
});
