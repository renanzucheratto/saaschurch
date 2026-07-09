import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  cartao: {
    p: 2.5,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } satisfies SxProps<Theme>,

  linhaDados: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
    gap: 2,
  } satisfies SxProps<Theme>,

  rotulo: {
    color: 'text.secondary',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  } satisfies SxProps<Theme>,

  valor: {
    fontSize: 18,
    fontWeight: 700,
  } satisfies SxProps<Theme>,

  acoes: {
    display: 'flex',
    gap: 1.5,
    flexWrap: 'wrap',
  } satisfies SxProps<Theme>,
});
