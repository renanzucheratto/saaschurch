import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  conteudo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    pt: 1,
  } satisfies SxProps<Theme>,
});
