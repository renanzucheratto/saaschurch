import { BORDER_RADIUS } from "@/config/utils/contants";
import { Components, Theme } from "@mui/material";

export const cardOverrides: Components<Theme> = {
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(2),
        borderRadius: theme.spacing(BORDER_RADIUS.small),
        boxShadow: 'none',
      }),
    },
    variants: [
      {
        props: { variant: 'elevation' },
        style: ({ theme }) => ({
          border: 0,
          boxShadow: theme.shadows[1],
        }),
      },
      {
        props: { variant: 'outlined' },
        style: ({ theme }) => ({
          border: `2px solid ${theme.palette.grey[200]}`,
        }),
      },
    ],
  },
};