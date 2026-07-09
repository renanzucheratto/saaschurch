import type { InstituicaoBackoffice } from '@/types/instituicao.types';
import type { Plano } from '@/types/plano.types';
import type { TrocarPlano } from './helpers/validation';

export interface DialogoTrocarPlanoProps {
  aberto: boolean;
  instituicao: InstituicaoBackoffice | null;
  planos: Plano[];
  enviando: boolean;
  onFechar: () => void;
  onConfirmar: (dados: TrocarPlano) => void;
}

export interface InitPointCopiavelProps {
  initPoint: string;
}
