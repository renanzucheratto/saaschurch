import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  chip: (gratuito: boolean): SxProps<Theme> => ({
    fontWeight: 700,
    letterSpacing: 0.2,
    bgcolor: gratuito ? 'success.light' : 'action.selected',
    color: gratuito ? 'success.contrastText' : 'text.primary',
  }),
});
