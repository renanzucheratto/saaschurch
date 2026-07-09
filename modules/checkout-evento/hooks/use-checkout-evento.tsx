'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCriarPagamentoMutation, useObterCheckoutConfigQuery } from '@/config/redux/api/pagamentosApi';
import { formatarMoeda } from '@/config/helpers/formatar-moeda';
import type { PagamentoStatus } from '@/types/pagamento.types';
import { MENSAGEM_SEM_CONTA_MP } from '../helpers/constants';
import { usePollingPagamento } from './use-polling-pagamento';
import type { CheckoutEventoProps, DadosBrick, PagamentoCriado } from '../types';

function codigoDoErro(erro: unknown): string | null {
  if (typeof erro !== 'object' || erro === null || !('data' in erro)) return null;

  const data = (erro as { data: unknown }).data;

  return typeof data === 'object' && data !== null && 'error' in data
    ? String((data as { error: unknown }).error)
    : null;
}

export function useCheckoutEvento({
  eventoId,
  participanteId,
  produtoIds,
  onConcluido,
}: CheckoutEventoProps) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [pagamento, setPagamento] = useState<PagamentoCriado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const {
    data: config,
    isLoading: carregandoConfig,
    error: erroConfig,
  } = useObterCheckoutConfigQuery(eventoId);

  const [criarPagamento, { isLoading: enviando }] = useCriarPagamentoMutation();

  const { status, statusDetail, finalizado, expirado } = usePollingPagamento({
    pagamentoId: pagamento?.pagamentoId ?? null,
    statusInicial: pagamento?.status ?? null,
    expiraEm: pagamento?.pix?.expiraEm ?? null,
  });

  // O total é a soma que o servidor devolveu para estes produtos. O valor real é
  // recalculado no backend; aqui ele só é exibido.
  const valorTotal = useMemo(() => {
    const selecionados = (config?.produtos ?? []).filter((p) => produtoIds.includes(p.id));

    const centavos = selecionados.reduce((total, produto) => {
      const [inteiro = '0', decimais = ''] = produto.valor.split('.');
      return total + Number(inteiro) * 100 + Number(`${decimais}00`.slice(0, 2));
    }, 0);

    return `${Math.trunc(centavos / 100)}.${String(centavos % 100).padStart(2, '0')}`;
  }, [config, produtoIds]);

  const semContaMp = codigoDoErro(erroConfig) === 'MP_ACCOUNT_INACTIVE';
  const featureIndisponivel = codigoDoErro(erroConfig) === 'FEATURE_INDISPONIVEL';

  const onSubmit = useCallback(
    async (dados: DadosBrick) => {
      if (!executeRecaptcha) {
        setErro('reCAPTCHA não está disponível. Recarregue a página.');
        return;
      }

      setErro(null);

      try {
        const recaptchaToken = await executeRecaptcha('checkout_pagamento');

        const criado = await criarPagamento({
          eventoId,
          participanteId,
          produtoIds,
          token: dados.token,
          paymentMethodId: dados.payment_method_id,
          installments: dados.installments,
          payer: {
            email: dados.payer?.email ?? '',
            identification:
              dados.payer?.identification?.type && dados.payer.identification.number
                ? {
                    type: dados.payer.identification.type,
                    number: dados.payer.identification.number,
                  }
                : undefined,
          },
          recaptchaToken,
        }).unwrap();

        setPagamento(criado);
      } catch (falha) {
        const codigo = codigoDoErro(falha);
        setErro(
          codigo === 'MP_ACCOUNT_INACTIVE'
            ? MENSAGEM_SEM_CONTA_MP
            : 'Não foi possível processar o pagamento. Tente novamente.',
        );
      }
    },
    [executeRecaptcha, criarPagamento, eventoId, participanteId, produtoIds],
  );

  const tentarNovamente = useCallback(() => {
    setPagamento(null);
    setErro(null);
  }, []);

  useEffect(() => {
    if (finalizado && status) onConcluido?.(status as PagamentoStatus);
  }, [finalizado, status, onConcluido]);

  return {
    // O Brick só monta depois da chave resolver — `initMercadoPago` é global e não
    // recarrega com outra chave.
    publicKey: config?.publicKey,
    valorTotal,
    valorFormatado: formatarMoeda(valorTotal),
    carregando: carregandoConfig,
    semContaMp,
    featureIndisponivel,
    erro,
    enviando,
    pagamento,
    pix: pagamento?.pix ?? null,
    status,
    statusDetail: statusDetail ?? pagamento?.statusDetail ?? null,
    finalizado,
    expirado,
    onSubmit,
    tentarNovamente,
  };
}
