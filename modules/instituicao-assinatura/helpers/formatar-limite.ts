/** `null` é ilimitado — nunca "null", nunca "0". */
export const formatarLimite = (limite: number | null) =>
  limite === null ? 'Ilimitado' : String(limite);
