import { createTheme } from "@mui/material";
import { components } from "./overrides";

export const theme = createTheme({
  components,
  palette: {
    primary: {
      main: "#7b57df",
      light: "#9b78ef",
      dark: "#5b3fbf",
    },
    secondary: {
      main: "#E8952A",
      light: "#F0B05A",
      dark: "#C07018",
    },
    background: {
      default: "#f9f9f9",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1624",
      secondary: "#6B6583",
    },
    divider: "#EAE8F5",
  },
  typography: {
    fontFamily: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});