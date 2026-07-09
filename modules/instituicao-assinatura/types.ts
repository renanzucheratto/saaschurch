import type { Assinatura, Plano } from '@/types/plano.types';

export interface CartaoCobrancaProps {
  assinatura: Assinatura;
  podeCancelar: boolean;
  cancelando: boolean;
  onCancelar: (motivo: string) => void;
}

export interface VitrinePlanosProps {
  planos: Plano[];
  codigoPlanoAtual: string | undefined;
}
