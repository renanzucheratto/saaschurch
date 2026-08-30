import { baseApi } from './baseApi';
import type {
  ConectarResponse,
  ContaPagBank,
  ListaPagamentosResponse,
} from '@/types/pagbank.types';

export const pagbankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    statusPagBank: builder.query<ContaPagBank, void>({
      query: () => '/pagbank/status',
      providesTags: ['PagBank'],
    }),

    /**
     * Mutation apesar de ser GET: cada chamada grava um state novo no banco
     * (TTL 10 min, uso único). Como query, o RTK Query cachearia a
     * authorizationUrl e reusaria um state já consumido ou expirado.
     */
    conectarPagBank: builder.mutation<ConectarResponse, void>({
      query: () => ({ url: '/pagbank/oauth/connect', method: 'GET' }),
    }),

    desvincularPagBank: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/pagbank/conta', method: 'DELETE' }),
      invalidatesTags: ['PagBank'],
    }),

    /**
     * Quanto sobra para a instituição num produto de determinado preço, e o
     * inverso (quanto cobrar para receber um valor líquido alvo).
     */
    simularTaxas: builder.query<
      {
        bruto: number;
        split: number;
        taxaPagBank: number;
        liquido: number;
        taxaPagBankDisponivel: boolean;
        liquidoDesejado?: number;
        porParcela?: Array<{ parcelas: number; taxas: number; liquido: number }>;
      },
      { valor?: number; liquidoDesejado?: number }
    >({
      query: (params) => ({ url: '/pagbank/simular-taxas', params }),
    }),

    listarPagamentosPagBank: builder.query<
      ListaPagamentosResponse,
      { eventoId?: string; status?: string; participanteId?: string; pagina?: number; porPagina?: number } | void
    >({
      query: (params) => ({ url: '/pagbank/pagamentos', params: params ?? undefined }),
      providesTags: ['PagBank'],
    }),
  }),
});

export const {
  useStatusPagBankQuery,
  useConectarPagBankMutation,
  useDesvincularPagBankMutation,
  useListarPagamentosPagBankQuery,
  useSimularTaxasQuery,
  useLazySimularTaxasQuery,
} = pagbankApi;
