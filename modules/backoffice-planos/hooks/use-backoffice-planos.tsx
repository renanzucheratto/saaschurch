'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  useAlternarParceiroPilotoMutation,
  useListarInstituicoesQuery,
} from '@/config/redux/api/instituicoesApi';
import { useAtribuirPlanoMutation, useListarPlanosQuery } from '@/config/redux/api/planosApi';
import { tratarErroPlano } from '@/lib/helpers/tratar-erro-plano';
import type { InstituicaoBackoffice } from '@/types/instituicao.types';
import type { TrocarPlano } from '../helpers/validation';

export function useBackofficePlanos() {
  const [emEdicao, setEmEdicao] = useState<InstituicaoBackoffice | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: instituicoes, isLoading: carregandoInstituicoes } = useListarInstituicoesQuery();
  const { data: catalogo, isLoading: carregandoPlanos } = useListarPlanosQuery();

  const [atribuirPlano, { isLoading: trocando }] = useAtribuirPlanoMutation();
  const [alternarParceiroPiloto] = useAlternarParceiroPilotoMutation();

  // `GET /planos` já filtra por `ativo`; a defesa aqui é contra um cache antigo.
  const planos = useMemo(
    () => (catalogo?.planos ?? []).filter((plano) => plano.ativo),
    [catalogo],
  );

  const onConfirmar = useCallback(
    async (dados: TrocarPlano) => {
      if (!emEdicao) return;

      setErro(null);

      try {
        const resposta = await atribuirPlano({ instituicaoId: emEdicao.id, ...dados }).unwrap();

        setEmEdicao(null);
        // Só a troca para plano pago devolve `initPoint` — é o link que a igreja usa
        // para autorizar. Sem ele, a troca já vigorou.
        setInitPoint(resposta.initPoint ?? null);
      } catch (falha) {
        setErro(tratarErroPlano(falha).mensagem);
      }
    },
    [emEdicao, atribuirPlano],
  );

  const onAlternarPiloto = useCallback(
    (instituicao: InstituicaoBackoffice) => {
      alternarParceiroPiloto({
        instituicaoId: instituicao.id,
        parceiroPiloto: !instituicao.parceiroPiloto,
      });
    },
    [alternarParceiroPiloto],
  );

  return {
    instituicoes: instituicoes ?? [],
    planos,
    emEdicao,
    initPoint,
    erro,
    trocando,
    carregando: carregandoInstituicoes || carregandoPlanos,
    abrirDialogo: setEmEdicao,
    fecharDialogo: () => setEmEdicao(null),
    fecharInitPoint: () => setInitPoint(null),
    onConfirmar,
    onAlternarPiloto,
  };
}
