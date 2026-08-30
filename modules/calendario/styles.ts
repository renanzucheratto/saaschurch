import { useTheme } from "@mui/material";
import { BORDER_RADIUS } from "@/config/utils/contants";

export function useCalendarioStyles() {
  const theme = useTheme();

  return {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
    },
    gridWrapper: {
      bgcolor: "background.paper",
      borderRadius: BORDER_RADIUS.medium,
      border: "1px solid",
      borderColor: "divider",
      p: 2,
      height: { xs: 760, md: 920 },
      "& .rbc-calendar": {
        fontFamily: theme.typography.fontFamily,
        color: theme.palette.text.primary,
      },
      "& .rbc-toolbar": {
        display: "none",
      },
      "& .rbc-header": {
        padding: "8px 4px",
        fontWeight: 600,
        borderColor: theme.palette.divider,
      },
      "& .rbc-month-view, & .rbc-time-view": {
        borderColor: theme.palette.divider,
      },
      "& .rbc-day-bg + .rbc-day-bg, & .rbc-header + .rbc-header, & .rbc-time-content > * + * > *": {
        borderColor: theme.palette.divider,
      },
      "& .rbc-off-range-bg": {
        backgroundColor: theme.palette.action.hover,
      },
      "& .rbc-today": {
        backgroundColor: theme.palette.action.selected,
      },
      "& .rbc-event": {
        border: "none",
        padding: 0,
        minHeight: 34,
      },
      "& .rbc-event.rbc-selected": {
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
      },
      "& .rbc-show-more": {
        color: theme.palette.primary.main,
        fontWeight: 600,
      },
    },
    itemBloco: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      height: "calc(100% - 4px)",
      width: "calc(100% - 6px)",
      mx: "3px",
      my: "2px",
      px: 1,
      py: 0.5,
      borderRadius: BORDER_RADIUS.default,
      borderLeft: "3px solid",
      cursor: "pointer",
      transition: "filter 0.15s ease",
      "&:hover": {
        filter: "brightness(0.96)",
      },
    },
    horaTexto: {
      flexShrink: 0,
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums",
      opacity: 0.85,
    },
    tituloTexto: {
      fontWeight: 600,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    dotExtra: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      flexShrink: 0,
      ml: 0.5,
      border: "1px solid rgba(255,255,255,0.85)",
    },
  } as const;
}
