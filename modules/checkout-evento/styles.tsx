import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
  } satisfies SxProps<Theme>,

  cabecalho: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 1.5,
    flexWrap: 'wrap',
  } satisfies SxProps<Theme>,

  total: {
    fontSize: 24,
    fontWeight: 700,
  } satisfies SxProps<Theme>,

  skeleton: {
    borderRadius: 3,
  } satisfies SxProps<Theme>,
});
