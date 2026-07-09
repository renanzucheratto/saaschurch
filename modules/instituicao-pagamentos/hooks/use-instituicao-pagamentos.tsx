'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useDesconectarMercadoPagoMutation,
  useIniciarConexaoMutation,
  useObterImpactoDesconexaoQuery,
  useObterStatusConexaoQuery,
} from '@/config/redux/api/paymentConnectApi';
import { ESTADOS_CONEXAO } from '../helpers/constants';
import { traduzirErroOauth } from '../helpers/traduzir-erro-oauth';

export function useInstituicaoPagamentos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogoAberto, setDialogoAberto] = useState(false);

  const conectado = searchParams.get('connected') === '1';
  const erroOauth = traduzirErroOauth(searchParams.get('error'));

  const { data: conexao, isLoading, refetch } = useObterStatusConexaoQuery();
  const { data: impacto } = useObterImpactoDesconexaoQuery();

  const [iniciarConexao, { isLoading: conectando }] = useIniciarConexaoMutation();
  const [desconectar, { isLoading: desconectando }] = useDesconectarMercadoPagoMutation();

  // Voltamos do Mercado Pago: o status mudou fora do app, e o query param já cumpriu
  // seu papel — limpá-lo evita reexibir o sucesso a cada re-render ou refresh.
  useEffect(() => {
    if (!conectado && !erroOauth) return;

    if (conectado) refetch();

    router.replace('/instituicao/pagamentos');
  }, [conectado, erroOauth, refetch, router]);

  const onConectar = useCallback(async () => {
    const { authorizeUrl } = await iniciarConexao().unwrap();

    // Saída do app para o domínio do MP: `router.push` trataria como rota interna.
    window.location.href = authorizeUrl;
  }, [iniciarConexao]);

  const onConfirmarDesconexao = useCallback(async () => {
    await desconectar().unwrap();
    setDialogoAberto(false);
  }, [desconectar]);

  const estado = ESTADOS_CONEXAO[conexao?.status ?? 'NAO_CONECTADO'];

  return {
    conexao,
    estado,
    sucesso: conectado,
    erroOauth,
    eventosAtivos: impacto?.eventosAtivos ?? 0,
    dialogoAberto,
    conectando,
    desconectando,
    carregando: isLoading,
    onCta: estado.conectado ? () => setDialogoAberto(true) : onConectar,
    fecharDialogo: () => setDialogoAberto(false),
    onConfirmarDesconexao,
  };
}
