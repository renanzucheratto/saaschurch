export type StatusConexaoMercadoPago =
  | 'NAO_CONECTADO'
  | 'PENDING'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED';

/** Nenhum campo de token aparece aqui. Se algum dia aparecer, é bug de backend. */
export interface ConexaoMercadoPago {
  status: StatusConexaoMercadoPago;
  mpUserId?: string;
  conectadoEm?: string;
  expiresAt?: string;
  ultimoErro?: string | null;
}

export interface ImpactoDesconexao {
  eventosAtivos: number;
}
