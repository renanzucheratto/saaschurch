import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } satisfies SxProps<Theme>,

  tabela: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 3,
    overflow: 'hidden',
  } satisfies SxProps<Theme>,

  celulaBadges: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    flexWrap: 'wrap',
  } satisfies SxProps<Theme>,

  skeleton: {
    borderRadius: 3,
  } satisfies SxProps<Theme>,
});
