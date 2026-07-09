'use client';

import { useCallback, useState } from 'react';
import {
  ROTULO_STATUS_ASSINATURA,
  SEVERIDADE_STATUS_ASSINATURA,
} from '../../../helpers/constants';
import type { CartaoCobrancaProps } from '../../../types';

const MOTIVO_MINIMO = 10;

export function useCartaoCobranca({ assinatura, onCancelar }: CartaoCobrancaProps) {
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [motivo, setMotivo] = useState('');

  const confirmar = useCallback(() => {
    onCancelar(motivo);
    setDialogoAberto(false);
    setMotivo('');
  }, [motivo, onCancelar]);

  return {
    rotuloStatus: ROTULO_STATUS_ASSINATURA[assinatura.status],
    severidade: SEVERIDADE_STATUS_ASSINATURA[assinatura.status],
    pendente: assinatura.status === 'PENDING',
    ativa: assinatura.status === 'AUTHORIZED',
    dialogoAberto,
    motivo,
    motivoValido: motivo.trim().length >= MOTIVO_MINIMO,
    abrirDialogo: () => setDialogoAberto(true),
    fecharDialogo: () => setDialogoAberto(false),
    onMotivoChange: setMotivo,
    confirmar,
  };
}
