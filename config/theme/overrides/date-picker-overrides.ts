import { BORDER_RADIUS } from "@/config/utils/contants";
import { Components, Theme } from "@mui/material";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import { ptBR } from "@mui/x-date-pickers/locales";

export const datePickerOverrides: Components<Theme> = {
  // Traduz os textos dos pickers (botões, toolbar e labels de acessibilidade).
  MuiLocalizationProvider: {
    defaultProps: {
      localeText: ptBR.components.MuiLocalizationProvider.defaultProps.localeText,
    },
  },
  MuiPickersOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.spacing(BORDER_RADIUS.default * 1.5),
      }),
    },
  },
  MuiPickerPopper: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: theme.spacing(BORDER_RADIUS.small),
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[3],
      }),
    },
  },
  MuiPickerDay: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.spacing(BORDER_RADIUS.default),
        fontWeight: 500,
        "&.Mui-selected": {
          fontWeight: 700,
          backgroundColor: theme.palette.primary.main,
          "&:hover, &:focus": { backgroundColor: theme.palette.primary.dark },
        },
        "&.MuiPickerDay-today:not(.Mui-selected)": {
          borderColor: theme.palette.primary.light,
        },
      }),
    },
  },
  MuiPickersCalendarHeader: {
    styleOverrides: {
      label: { fontWeight: 600, textTransform: "capitalize" },
    },
  },
  MuiDayCalendar: {
    styleOverrides: {
      weekDayLabel: ({ theme }) => ({
        fontWeight: 600,
        color: theme.palette.text.secondary,
        textTransform: "capitalize",
      }),
    },
  },
};
