'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trocarPlanoSchema, type TrocarPlano } from '../../../helpers/validation';
import type { DialogoTrocarPlanoProps } from '../../../types';

export function useDialogoTrocarPlano({
  aberto,
  instituicao,
  planos,
  onConfirmar,
}: DialogoTrocarPlanoProps) {
  const [confirmouCancelamento, setConfirmouCancelamento] = useState(false);

  const form = useForm<TrocarPlano>({
    resolver: zodResolver(trocarPlanoSchema),
    defaultValues: { planoCodigo: '', motivo: '' },
  });

  const planoCodigo = form.watch('planoCodigo');
  const planoDestino = planos.find((plano) => plano.codigo === planoCodigo);

  // A pergunta é "o destino cobra?", não "o destino é o PILOTO_FREE?". Um plano pago
  // que passe a ter `cobrancaSaaS: false` dispara o mesmo aviso, sem tocar neste código.
  const vaiCancelarAssinatura =
    planoDestino?.cobrancaSaaS === false && instituicao?.assinaturaStatus === 'AUTHORIZED';

  const vaiExigirAssinatura = planoDestino?.cobrancaSaaS === true;

  useEffect(() => {
    if (!aberto) {
      form.reset();
      setConfirmouCancelamento(false);
    }
  }, [aberto, form]);

  return {
    form,
    planoDestino,
    vaiCancelarAssinatura,
    vaiExigirAssinatura,
    confirmouCancelamento,
    setConfirmouCancelamento,
    bloqueiaSubmit: vaiCancelarAssinatura && !confirmouCancelamento,
    onSubmit: form.handleSubmit(onConfirmar),
  };
}
