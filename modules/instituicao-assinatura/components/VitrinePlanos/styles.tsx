import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  grade: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
    gap: 2,
  } satisfies SxProps<Theme>,

  cartao: (atual: boolean): SxProps<Theme> => ({
    p: 2.5,
    borderRadius: 3,
    border: '1px solid',
    borderColor: atual ? 'primary.main' : 'divider',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  }),

  preco: {
    fontSize: 24,
    fontWeight: 700,
  } satisfies SxProps<Theme>,

  detalhe: {
    color: 'text.secondary',
    fontSize: 13,
  } satisfies SxProps<Theme>,
});
