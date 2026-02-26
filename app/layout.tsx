"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "@/config/theme/theme";
import { ReduxProvider } from "@/config/redux";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
