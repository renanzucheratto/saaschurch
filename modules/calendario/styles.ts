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
      height: { xs: 640, md: 760 },
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
        padding: "2px 6px",
      },
      "& .rbc-event.rbc-selected": {
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
      },
      "& .rbc-show-more": {
        color: theme.palette.primary.main,
        fontWeight: 600,
      },
    },
    eventoBloco: {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      cursor: "default",
      opacity: 0.85,
    },
    ocorrenciaBloco: {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      cursor: "pointer",
    },
    dotExtra: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      flexShrink: 0,
      border: "1px solid rgba(255,255,255,0.7)",
    },
  } as const;
}
