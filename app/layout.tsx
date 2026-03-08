"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "@/config/theme/theme";
import { ReduxProvider } from "@/config/redux";
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body className={notoSans.className}>
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
