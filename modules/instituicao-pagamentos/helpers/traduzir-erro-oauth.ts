const MENSAGENS: Record<string, string> = {
  INVALID_STATE:
    'A autorização expirou ou já foi usada. Tente conectar novamente.',
  JA_CONECTADO: 'Esta instituição já tem uma conta do Mercado Pago conectada.',
  access_denied: 'A autorização foi negada no Mercado Pago.',
  invalid_client: 'Credenciais da plataforma inválidas. Fale com o suporte.',
};

/** Nunca devolve o código bruto — o usuário não deve ver `INVALID_STATE` na tela. */
export const traduzirErroOauth = (codigo: string | null): string | null =>
  codigo ? (MENSAGENS[codigo] ?? 'Não foi possível concluir a conexão. Tente novamente.') : null;
