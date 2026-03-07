"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "@/config/theme/theme";
import { ReduxProvider } from "@/config/redux";
import { Noto_Sans } from "next/font/google";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

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
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  console.log('[LAYOUT] reCAPTCHA Key configurada:', recaptchaKey ? 'SIM' : 'NÃO');
  console.log('[LAYOUT] reCAPTCHA Key (primeiros 10 chars):', recaptchaKey.substring(0, 10));
  
  return (
    <html lang="en">
      <body className={notoSans.className}>
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
          <ReduxProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </ReduxProvider>
        </GoogleReCaptchaProvider>
      </body>
    </html>
  );
}
