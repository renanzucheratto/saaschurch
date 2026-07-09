'use client';

import { useEffect } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import type { DadosBrick, PaymentBrickProps } from '../../../types';

interface SubmitDoBrick {
  formData: DadosBrick;
}

export function usePaymentBrick({ publicKey, valor, onSubmit }: PaymentBrickProps) {
  // `initMercadoPago` é global e não recarrega com outra chave. Só é chamado depois de
  // `publicKey` resolvida, e o `key={publicKey}` no componente força a remontagem.
  useEffect(() => {
    initMercadoPago(publicKey, { locale: 'pt-BR' });
  }, [publicKey]);

  // O Brick exige `amount` como number. É a fronteira do SDK: o valor de verdade é
  // recalculado no servidor a partir de `ProdutosEvento.valor`.
  const amount = Number(valor);

  const onSubmitBrick = async ({ formData }: SubmitDoBrick) => {
    onSubmit(formData);
  };

  return { amount, onSubmitBrick };
}
