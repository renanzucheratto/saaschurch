import { baseApi } from './baseApi';
import type {
  ConectarResponse,
  ContaMercadoPago,
  ListaPagamentosResponse,
} from '@/types/mercadopago.types';

export const mercadopagoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    statusMercadoPago: builder.query<ContaMercadoPago, void>({
      query: () => '/mercadopago/status',
      providesTags: ['MercadoPago'],
    }),

    /**
     * Mutation apesar de ser GET: cada chamada grava um OAuthNonce novo no
     * banco (TTL 10 min, uso único). Como query, o RTK Query cachearia a
     * authorizationUrl e reusaria um nonce já consumido ou expirado.
     */
    conectarMercadoPago: builder.mutation<ConectarResponse, void>({
      query: () => ({ url: '/mercadopago/oauth/connect', method: 'GET' }),
    }),

    desvincularMercadoPago: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/mercadopago/conta', method: 'DELETE' }),
      invalidatesTags: ['MercadoPago'],
    }),

    listarPagamentosMercadoPago: builder.query<
      ListaPagamentosResponse,
      { eventoId?: string; status?: string; participanteId?: string; pagina?: number; porPagina?: number } | void
    >({
      query: (params) => ({ url: '/mercadopago/pagamentos', params: params ?? undefined }),
      providesTags: ['MercadoPago'],
    }),
  }),
});

export const {
  useStatusMercadoPagoQuery,
  useConectarMercadoPagoMutation,
  useDesvincularMercadoPagoMutation,
  useListarPagamentosMercadoPagoQuery,
} = mercadopagoApi;
