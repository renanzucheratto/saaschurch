import { baseApi } from './baseApi';
import type { InstituicaoBackoffice } from '@/types/instituicao.types';

export const instituicoesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarInstituicoes: builder.query<InstituicaoBackoffice[], void>({
      query: () => '/instituicoes',
      providesTags: ['Instituicoes'],
    }),
    alternarParceiroPiloto: builder.mutation<
      { parceiroPiloto: boolean },
      { instituicaoId: string; parceiroPiloto: boolean }
    >({
      query: ({ instituicaoId, ...body }) => ({
        url: `/instituicoes/${instituicaoId}/parceiro-piloto`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Instituicoes'],
    }),
  }),
});

export const { useListarInstituicoesQuery, useAlternarParceiroPilotoMutation } = instituicoesApi;
