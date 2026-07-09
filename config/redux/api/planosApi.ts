import { baseApi } from './baseApi';
import type { AtribuirPlanoResposta, MeuPlano, Plano } from '@/types/plano.types';

export const planosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarPlanos: builder.query<{ planos: Plano[] }, void>({
      query: () => '/planos',
      providesTags: ['Plano'],
    }),
    obterMeuPlano: builder.query<MeuPlano, void>({
      query: () => '/planos/meu',
      providesTags: ['Plano'],
    }),
    atribuirPlano: builder.mutation<
      AtribuirPlanoResposta,
      { instituicaoId: string; planoCodigo: string; motivo: string }
    >({
      query: ({ instituicaoId, ...body }) => ({
        url: `/planos/instituicao/${instituicaoId}`,
        method: 'PATCH',
        body,
      }),
      // A troca pode criar ou cancelar uma assinatura — as tags caem juntas.
      invalidatesTags: ['Plano', 'Assinatura', 'Instituicoes'],
    }),
  }),
});

export const { useListarPlanosQuery, useObterMeuPlanoQuery, useAtribuirPlanoMutation } = planosApi;
