import { baseApi } from './baseApi';
import type {
  AtualizarPlanoResponse,
  PlanoAtualResponse,
  PlanosDisponiveisResponse,
} from '@/types/plano.types';

export const planosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarPlanosDisponiveis: builder.query<PlanosDisponiveisResponse, void>({
      query: () => '/planos/disponiveis',
      providesTags: ['Plano'],
    }),
    planoAtual: builder.query<PlanoAtualResponse, void>({
      query: () => '/planos/meu',
      providesTags: ['Plano'],
    }),
    atualizarPlano: builder.mutation<AtualizarPlanoResponse, { planoId: string }>({
      query: (body) => ({ url: '/planos/meu', method: 'PUT', body }),
      // Invalida as duas leituras: a lista marca qual é o atual, e o resumo
      // mostra a taxa efetiva — ambas mudam ao trocar de plano.
      invalidatesTags: ['Plano'],
    }),
  }),
});

export const {
  useListarPlanosDisponiveisQuery,
  usePlanoAtualQuery,
  useAtualizarPlanoMutation,
} = planosApi;
