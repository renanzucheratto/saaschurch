import { baseApi } from './baseApi';
import type { ConexaoMercadoPago, ImpactoDesconexao } from '@/types/payment-connect.types';

export const paymentConnectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    obterStatusConexao: builder.query<ConexaoMercadoPago, void>({
      // `instituicaoId` sai de `req.user` no backend — o frontend não o envia.
      query: () => '/payment-connect/status',
      providesTags: ['PaymentConnect'],
    }),
    obterImpactoDesconexao: builder.query<ImpactoDesconexao, void>({
      query: () => '/payment-connect/impacto-desconexao',
      providesTags: ['PaymentConnect'],
    }),
    iniciarConexao: builder.mutation<{ authorizeUrl: string }, void>({
      query: () => ({ url: '/payment-connect/authorize', method: 'POST' }),
    }),
    desconectarMercadoPago: builder.mutation<void, void>({
      query: () => ({ url: '/payment-connect', method: 'DELETE' }),
      invalidatesTags: ['PaymentConnect'],
    }),
  }),
});

export const {
  useObterStatusConexaoQuery,
  useObterImpactoDesconexaoQuery,
  useIniciarConexaoMutation,
  useDesconectarMercadoPagoMutation,
} = paymentConnectApi;
