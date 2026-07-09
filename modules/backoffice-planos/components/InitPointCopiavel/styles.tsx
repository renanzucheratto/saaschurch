import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 1,
    borderRadius: 2,
    bgcolor: 'action.hover',
  } satisfies SxProps<Theme>,

  link: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'monospace',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } satisfies SxProps<Theme>,
});
