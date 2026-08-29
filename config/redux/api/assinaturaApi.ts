import { baseApi } from './baseApi';
import type { StatusAssinatura } from '@/types/pagbank.types';

export interface AssinarRequest {
  cartaoCifrado: string;
  securityCode: string;
}

export interface AssinarResponse {
  assinaturaId: string;
  status: string;
  cardBrand: string | null;
  cardUltimosDigitos: string | null;
}

export const assinaturaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    statusAssinatura: builder.query<StatusAssinatura, void>({
      query: () => '/assinaturas/status',
      providesTags: ['Assinatura'],
    }),

    /** Chave pública do PagBank para `PagSeguro.encryptCard()` cifrar o cartão no browser. */
    chavePublicaAssinatura: builder.query<{ publicKey: string }, void>({
      query: () => '/assinaturas/chave-publica',
    }),

    assinar: builder.mutation<AssinarResponse, AssinarRequest>({
      query: (body) => ({ url: '/assinaturas', method: 'POST', body }),
      invalidatesTags: ['Assinatura'],
    }),

    cancelarAssinatura: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/assinaturas', method: 'DELETE' }),
      invalidatesTags: ['Assinatura'],
    }),
  }),
});

export const {
  useStatusAssinaturaQuery,
  useChavePublicaAssinaturaQuery,
  useLazyChavePublicaAssinaturaQuery,
  useAssinarMutation,
  useCancelarAssinaturaMutation,
} = assinaturaApi;
