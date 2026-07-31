import { baseApi } from './baseApi';

export interface CriarPreferenceRequest {
  participanteId: string;
  produtoId: string;
  recaptchaToken: string;
}

export interface CriarPreferenceResponse {
  init_point: string;
  mpPagamentoId: string;
  valor?: number;
  splitValor?: number;
  reaproveitada?: boolean;
}

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Rota pública: o participante não é usuário do sistema. O baseQuery
     * anexa o Bearer se houver sessão, mas a API não exige.
     */
    criarPreferenceCheckout: builder.mutation<CriarPreferenceResponse, CriarPreferenceRequest>({
      query: (body) => ({ url: '/checkout/preferences', method: 'POST', body }),
    }),
  }),
});

export const { useCriarPreferenceCheckoutMutation } = checkoutApi;
