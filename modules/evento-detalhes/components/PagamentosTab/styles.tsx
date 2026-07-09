import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } satisfies SxProps<Theme>,

  totais: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
    gap: 2,
  } satisfies SxProps<Theme>,

  cartaoTotal: {
    p: 2,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 3,
  } satisfies SxProps<Theme>,

  rotuloTotal: {
    color: 'text.secondary',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  } satisfies SxProps<Theme>,

  valorTotal: {
    fontSize: 22,
    fontWeight: 700,
  } satisfies SxProps<Theme>,

  filtro: {
    maxWidth: 260,
  } satisfies SxProps<Theme>,

  grid: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 3,
  } satisfies SxProps<Theme>,

  skeleton: {
    borderRadius: 3,
  } satisfies SxProps<Theme>,
});
