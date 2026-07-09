import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  alerta: {
    borderRadius: 2,
    mx: { xs: 2, sm: 2.5 },
    mt: 1.5,
  } satisfies SxProps<Theme>,
});
