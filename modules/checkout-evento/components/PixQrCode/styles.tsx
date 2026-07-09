import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textAlign: 'center',
  } satisfies SxProps<Theme>,

  qr: {
    width: 220,
    height: 220,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
  } satisfies SxProps<Theme>,

  codigo: {
    width: '100%',
    fontFamily: 'monospace',
    fontSize: 12,
    wordBreak: 'break-all',
    p: 1.5,
    borderRadius: 2,
    bgcolor: 'action.hover',
  } satisfies SxProps<Theme>,

  contador: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700,
  } satisfies SxProps<Theme>,
});
