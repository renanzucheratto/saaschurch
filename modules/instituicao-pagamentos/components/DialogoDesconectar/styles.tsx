import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  conteudo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
  } satisfies SxProps<Theme>,
});
