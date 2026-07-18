import { baseApi } from './baseApi';
import type {
  CategoriaFinanceira,
  ClassificarPayload,
  ContaBancaria,
  Fornecedor,
  RegraConciliacao,
  ResultadoImportacao,
  SaldoConta,
  TransacaoBancaria,
  TransacoesFiltros,
  TransacoesResponse,
} from '@/types/financeiro.types';

export const financeiroApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Contas bancárias ====================
    listarContas: builder.query<ContaBancaria[], void>({
      query: () => '/financeiro/contas',
      providesTags: ['ContasBancarias'],
    }),
    criarConta: builder.mutation<ContaBancaria, Partial<ContaBancaria>>({
      query: (body) => ({ url: '/financeiro/contas', method: 'POST', body }),
      invalidatesTags: ['ContasBancarias'],
    }),
    atualizarConta: builder.mutation<ContaBancaria, { id: string } & Partial<ContaBancaria>>({
      query: ({ id, ...body }) => ({ url: `/financeiro/contas/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ContasBancarias', 'SaldoConta'],
    }),
    removerConta: builder.mutation<void, string>({
      query: (id) => ({ url: `/financeiro/contas/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ContasBancarias'],
    }),
    saldoConta: builder.query<SaldoConta, string>({
      query: (id) => `/financeiro/contas/${id}/saldo`,
      providesTags: (result, error, id) => [{ type: 'SaldoConta', id }],
    }),
    importarExtrato: builder.mutation<
      ResultadoImportacao,
      { id: string; dataInicio: string; dataFim: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/financeiro/contas/${id}/importar`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TransacoesBancarias', 'SaldoConta'],
    }),

    // ==================== Categorias ====================
    listarCategorias: builder.query<CategoriaFinanceira[], void>({
      query: () => '/financeiro/categorias',
      providesTags: ['CategoriasFinanceiras'],
    }),
    criarCategoria: builder.mutation<CategoriaFinanceira, { nome: string; tipo: string }>({
      query: (body) => ({ url: '/financeiro/categorias', method: 'POST', body }),
      invalidatesTags: ['CategoriasFinanceiras'],
    }),
    atualizarCategoria: builder.mutation<
      CategoriaFinanceira,
      { id: string; nome?: string; tipo?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/financeiro/categorias/${id}`, method: 'PUT', body }),
      invalidatesTags: ['CategoriasFinanceiras', 'TransacoesBancarias', 'RegrasConciliacao'],
    }),
    removerCategoria: builder.mutation<void, string>({
      query: (id) => ({ url: `/financeiro/categorias/${id}`, method: 'DELETE' }),
      invalidatesTags: ['CategoriasFinanceiras', 'TransacoesBancarias', 'RegrasConciliacao'],
    }),

    // ==================== Fornecedores ====================
    listarFornecedores: builder.query<Fornecedor[], void>({
      query: () => '/financeiro/fornecedores',
      providesTags: ['Fornecedores'],
    }),
    criarFornecedor: builder.mutation<Fornecedor, Partial<Fornecedor>>({
      query: (body) => ({ url: '/financeiro/fornecedores', method: 'POST', body }),
      invalidatesTags: ['Fornecedores'],
    }),
    atualizarFornecedor: builder.mutation<Fornecedor, { id: string } & Partial<Fornecedor>>({
      query: ({ id, ...body }) => ({ url: `/financeiro/fornecedores/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Fornecedores', 'TransacoesBancarias', 'RegrasConciliacao'],
    }),
    removerFornecedor: builder.mutation<void, string>({
      query: (id) => ({ url: `/financeiro/fornecedores/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Fornecedores', 'TransacoesBancarias', 'RegrasConciliacao'],
    }),

    // ==================== Regras ====================
    listarRegras: builder.query<RegraConciliacao[], void>({
      query: () => '/financeiro/regras',
      providesTags: ['RegrasConciliacao'],
    }),
    criarRegra: builder.mutation<RegraConciliacao, Partial<RegraConciliacao>>({
      query: (body) => ({ url: '/financeiro/regras', method: 'POST', body }),
      invalidatesTags: ['RegrasConciliacao'],
    }),
    atualizarRegra: builder.mutation<RegraConciliacao, { id: string } & Partial<RegraConciliacao>>({
      query: ({ id, ...body }) => ({ url: `/financeiro/regras/${id}`, method: 'PUT', body }),
      invalidatesTags: ['RegrasConciliacao'],
    }),
    removerRegra: builder.mutation<void, string>({
      query: (id) => ({ url: `/financeiro/regras/${id}`, method: 'DELETE' }),
      invalidatesTags: ['RegrasConciliacao'],
    }),
    aplicarRegra: builder.mutation<{ classificadas: number }, { id: string; contaId?: string }>({
      query: ({ id, ...body }) => ({
        url: `/financeiro/regras/${id}/aplicar`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TransacoesBancarias'],
    }),

    // ==================== Transações ====================
    listarTransacoes: builder.query<TransacoesResponse, TransacoesFiltros>({
      query: (filtros) => {
        const params = new URLSearchParams();
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });
        return `/financeiro/transacoes?${params.toString()}`;
      },
      providesTags: ['TransacoesBancarias'],
    }),
    classificarTransacao: builder.mutation<
      { transacao: TransacaoBancaria; regraCriada: RegraConciliacao | null },
      ClassificarPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/financeiro/transacoes/${id}/classificar`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['TransacoesBancarias', 'RegrasConciliacao'],
    }),
    desclassificarTransacao: builder.mutation<TransacaoBancaria, string>({
      query: (id) => ({ url: `/financeiro/transacoes/${id}/desclassificar`, method: 'PATCH' }),
      invalidatesTags: ['TransacoesBancarias'],
    }),
    reprocessarTransacoes: builder.mutation<{ classificadas: number }, { contaId?: string }>({
      query: (body) => ({ url: '/financeiro/transacoes/reprocessar', method: 'POST', body }),
      invalidatesTags: ['TransacoesBancarias'],
    }),
  }),
});

export const {
  useListarContasQuery,
  useCriarContaMutation,
  useAtualizarContaMutation,
  useRemoverContaMutation,
  useSaldoContaQuery,
  useImportarExtratoMutation,
  useListarCategoriasQuery,
  useCriarCategoriaMutation,
  useAtualizarCategoriaMutation,
  useRemoverCategoriaMutation,
  useListarFornecedoresQuery,
  useCriarFornecedorMutation,
  useAtualizarFornecedorMutation,
  useRemoverFornecedorMutation,
  useListarRegrasQuery,
  useCriarRegraMutation,
  useAtualizarRegraMutation,
  useRemoverRegraMutation,
  useAplicarRegraMutation,
  useListarTransacoesQuery,
  useClassificarTransacaoMutation,
  useDesclassificarTransacaoMutation,
  useReprocessarTransacoesMutation,
} = financeiroApi;
