import { baseApi } from './baseApi';
import type { AssinaturaStatus, RespostaAssinatura } from '@/types/plano.types';

export const assinaturaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    obterAssinatura: builder.query<RespostaAssinatura, void>({
      query: () => '/billing/assinaturas',
      providesTags: ['Assinatura'],
    }),
    criarAssinatura: builder.mutation<
      { assinaturaId: string; initPoint: string },
      { instituicaoId: string; planoCodigo: string; periodicidade?: 'mensal' | 'anual' }
    >({
      query: (body) => ({ url: '/billing/assinaturas', method: 'POST', body }),
      invalidatesTags: ['Assinatura', 'Plano'],
    }),
    cancelarAssinatura: builder.mutation<{ status: AssinaturaStatus }, { id: string; motivo: string }>({
      query: ({ id, ...body }) => ({
        url: `/billing/assinaturas/${id}/cancelar`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Assinatura', 'Plano'],
    }),
  }),
});

export const {
  useObterAssinaturaQuery,
  useCriarAssinaturaMutation,
  useCancelarAssinaturaMutation,
} = assinaturaApi;
