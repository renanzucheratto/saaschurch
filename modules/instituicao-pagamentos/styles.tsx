import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
  } satisfies SxProps<Theme>,

  cartao: {
    p: 2.5,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } satisfies SxProps<Theme>,

  dados: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
    gap: 2,
  } satisfies SxProps<Theme>,

  rotulo: {
    color: 'text.secondary',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  } satisfies SxProps<Theme>,

  skeleton: {
    borderRadius: 3,
  } satisfies SxProps<Theme>,
});
