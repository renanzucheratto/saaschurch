import { formatarLimite } from './formatar-limite';

/** `12 / 20`, ou `12 / Ilimitado` quando o plano não impõe teto. */
export const formatarUso = (uso: number, limite: number | null) =>
  `${uso} / ${formatarLimite(limite)}`;
