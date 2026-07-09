import { baseApi } from './baseApi';
import type {
  CheckoutConfig,
  CriarPagamentoBody,
  CriarPagamentoResposta,
  PagamentosEvento,
  StatusPagamento,
} from '@/types/pagamento.types';

export const pagamentosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    obterCheckoutConfig: builder.query<CheckoutConfig, string>({
      query: (eventoId) => `/pagamentos/checkout-config/${eventoId}`,
      providesTags: (result, error, eventoId) => [{ type: 'Pagamentos', id: `config-${eventoId}` }],
    }),
    obterPagamento: builder.query<StatusPagamento, string>({
      query: (pagamentoId) => `/pagamentos/${pagamentoId}`,
      providesTags: (result, error, id) => [{ type: 'Pagamentos', id }],
    }),
    listarPagamentosEvento: builder.query<PagamentosEvento, string>({
      query: (eventoId) => `/pagamentos/evento/${eventoId}`,
      providesTags: (result, error, eventoId) => [{ type: 'Pagamentos', id: eventoId }],
    }),
    criarPagamento: builder.mutation<CriarPagamentoResposta, CriarPagamentoBody>({
      query: (body) => ({ url: '/pagamentos', method: 'POST', body }),
      // A aprovação preenche a Parcela do participante — a lista de participantes muda junto.
      invalidatesTags: ['Pagamentos', 'Participantes'],
    }),
  }),
});

export const {
  useObterCheckoutConfigQuery,
  useObterPagamentoQuery,
  useListarPagamentosEventoQuery,
  useCriarPagamentoMutation,
} = pagamentosApi;
