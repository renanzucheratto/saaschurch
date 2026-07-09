import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'flex-start',
  } satisfies SxProps<Theme>,
});
