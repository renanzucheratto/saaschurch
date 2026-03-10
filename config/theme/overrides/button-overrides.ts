import { BORDER_RADIUS } from "@/config/utils/contants";
import { Components, Theme } from "@mui/material";

export const buttonOverrides: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.spacing(BORDER_RADIUS.full),
      }),
    },
  },
};