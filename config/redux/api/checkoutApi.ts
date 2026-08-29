import { baseApi } from './baseApi';
import type { PagBankPagamentoStatus } from '@/types/pagbank.types';

export type MetodoPagamento = 'PIX' | 'BOLETO' | 'CREDIT_CARD';

export interface CartaoCheckoutRequest {
  /** Saída de `PagSeguro.encryptCard()` no browser — nunca o PAN em claro. */
  encrypted: string;
  securityCode: string;
  parcelas: number;
}

export interface CriarPedidoRequest {
  participanteId: string;
  produtoId: string;
  recaptchaToken: string;
  metodoPagamento: MetodoPagamento;
  cartao?: CartaoCheckoutRequest;
  /**
   * Preenchido só quando a inscrição não trouxe e-mail/CPF — o PagBank exige
   * os dois em todo pedido, e nem todo evento coleta esses campos.
   */
  contato?: { email?: string; cpf?: string };
}

export interface PedidoCheckoutResponse {
  pagamentoId: string;
  status: PagBankPagamentoStatus;
  metodoPagamento: MetodoPagamento | null;
  valor: number;
  qrCodeTexto: string | null;
  qrCodeImagemUrl: string | null;
  boletoUrl: string | null;
  expiraEm: string | null;
}

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Rota pública: o participante não é usuário do sistema. O baseQuery
     * anexa o Bearer se houver sessão, mas a API não exige.
     *
     * Diferente do antigo fluxo Mercado Pago (redirect via init_point), o
     * PagBank não aceita split em checkout hospedado — esta chamada cria o
     * pedido e devolve os dados para a NOSSA tela de pagamento exibir
     * (QR Pix ou o resultado imediato do cartão).
     */
    criarPedidoCheckout: builder.mutation<PedidoCheckoutResponse, CriarPedidoRequest>({
      query: (body) => ({ url: '/checkout/pedidos', method: 'POST', body }),
    }),

    /** Polling de status — não há redirect de volta do PagBank para o front. */
    statusPedidoCheckout: builder.query<PedidoCheckoutResponse, string>({
      query: (pagamentoId) => `/checkout/pedidos/${pagamentoId}`,
    }),

    /** O que está sendo cobrado e em quantas vezes cabe. */
    resumoCheckout: builder.query<
      { produtoNome: string; valor: number; exigePagamento: boolean; maxParcelas: number },
      { participanteId: string; produtoId: string }
    >({
      query: (params) => ({ url: '/checkout/resumo', params }),
    }),

    /** Chave pública da instituição, para cifrar o cartão antes de enviar. */
    chavePublicaCheckout: builder.query<{ publicKey: string }, { produtoId: string }>({
      query: ({ produtoId }) => ({ url: '/checkout/chave-publica', params: { produtoId } }),
    }),
  }),
});

export const {
  useCriarPedidoCheckoutMutation,
  useStatusPedidoCheckoutQuery,
  useLazyStatusPedidoCheckoutQuery,
  useLazyChavePublicaCheckoutQuery,
  useResumoCheckoutQuery,
} = checkoutApi;
