"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

/**
 * A tela de pagamento chama `executeRecaptcha` antes de criar o pedido, e a
 * rota /checkout/pedidos é pública — o token do reCAPTCHA é o que impede
 * alguém de disparar cobranças em massa. Sem este provider o hook existe mas
 * nunca resolve, e a falha aparece como um erro genérico de cobrança.
 */
export default function InscricaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey}>{children}</GoogleReCaptchaProvider>;
}
