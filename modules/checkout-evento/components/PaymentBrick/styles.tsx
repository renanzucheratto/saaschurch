import type { SxProps, Theme } from '@mui/material';

export const useStyles = () => ({
  // O Brick é responsivo, mas precisa de um container com largura definida.
  container: {
    width: '100%',
    maxWidth: 560,
    mx: 'auto',
  } satisfies SxProps<Theme>,
});
