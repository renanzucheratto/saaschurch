import type {} from '@mui/x-data-grid/themeAugmentation';
import { BORDER_RADIUS } from '@/config/utils/contants';
import { Components, Theme } from "@mui/material";

import { ptBR } from '@mui/x-data-grid/locales';

export const dataGridOverrides: Components<Theme> = {
  MuiDataGrid: {
    styleOverrides: {
      root: ({theme}) => ({
        borderRadius: theme.spacing(BORDER_RADIUS.default),
        border: `1px solid ${theme.palette.grey[300]}!important`,
        '.MuiDataGrid-columnHeaders': {
          borderBottom: '0!important',
          '> div[role="row"]': {
            height: '46px!important',
          },
        },
        '.MuiDataGrid-columnHeader': {
          backgroundColor: theme.palette.grey[100],
        },
      }),
    },
    defaultProps: {
      localeText: ptBR.components.MuiDataGrid.defaultProps.localeText,
    },
  },
};
