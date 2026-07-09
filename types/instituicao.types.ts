import type { AssinaturaStatus, Plano } from './plano.types';

export interface InstituicaoBackoffice {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  logoUrl: string | null;
  parceiroPiloto: boolean;
  planoAtribuidoEm: string | null;
  planoAtribuidoPor: string | null;
  /** `null` quando a instituição está no plano padrão do sistema. */
  plano: Plano | null;
  assinaturaStatus: AssinaturaStatus | null;
  _count: { users: number; eventos: number };
}
