import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  } satisfies SxProps<Theme>,

  cabecalho: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    flexWrap: 'wrap',
  } satisfies SxProps<Theme>,

  cartao: {
    p: 2.5,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 3,
  } satisfies SxProps<Theme>,

  gradeMetricas: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
    gap: 2,
    mt: 2,
  } satisfies SxProps<Theme>,

  metrica: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  } satisfies SxProps<Theme>,

  rotuloMetrica: {
    color: 'text.secondary',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  } satisfies SxProps<Theme>,

  valorMetrica: {
    fontSize: 20,
    fontWeight: 700,
  } satisfies SxProps<Theme>,

  skeleton: {
    borderRadius: 3,
  } satisfies SxProps<Theme>,
});
