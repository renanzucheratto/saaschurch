import { createTheme } from "@mui/material";
import { components } from "./overrides";

export const theme = createTheme({
  components,
  palette: {
    primary: {
      main: "#7b57df",
    },
  },
  typography: {
    fontFamily: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});