import "@mui/material/Paper";

declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    withTitle: true;
  }
}
