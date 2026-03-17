import { baseApi } from './baseApi';
import { EventoListagem, EventoDetalhes, Participante, Produto } from '@/types/evento.types';

export interface ProdutoEventoRequest {
  id?: string;
  nome: string;
  descricao?: string;
  valor: number;
}

export interface CadastrarEventoRequest {
  nome: string;
  data_inicio: string;
  data_fim: string;
  descricao?: string;
  imagem_url?: string;
  selecao_unica_produto?: boolean;
  produtos?: ProdutoEventoRequest[];
}

export type CadastrarEventoResponse = EventoDetalhes;

export type ParticipanteResponse = Participante;

export type ProdutoEvento = Produto;

export type Evento = EventoDetalhes;

export interface ProdutoSelecionado {
  produtoId: string;
  valor_pago?: number;
}

export interface ParticipanteRequest {
  nome: string;
  email: string;
  telefone: string;
  rg: string;
  cpf: string;
  termo_assinado: boolean;
  recaptchaToken: string;
  produtos_selecionados: ProdutoSelecionado[];
}

export interface EstatisticaParticipantesPorProduto {
  produtoId: string;
  produtoNome: string;
  quantidadeParticipantes: number;
}

export interface EstatisticaPizza {
  id: string;
  label: string;
  value: number;
}

export const eventosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarEventos: builder.query<EventoListagem[], void>({
      query: () => '/eventos',
      providesTags: ['Eventos'],
    }),
    obterEvento: builder.query<EventoDetalhes, string>({
      query: (eventoId) => `/eventos/${eventoId}`,
      providesTags: (result, error, eventoId) => [{ type: 'Eventos', id: eventoId }],
    }),
    listarParticipantes: builder.query<Participante[], { eventoId: string; isDeleted?: boolean }>({
      query: ({ eventoId, isDeleted }) => `/eventos/${eventoId}/participantes${isDeleted !== undefined ? `?isDeleted=${isDeleted}` : ''}`,
      providesTags: (result, error, { eventoId }) => [{ type: 'Participantes', id: eventoId }],
    }),
    obterEstatisticasParticipantesPorProduto: builder.query<EstatisticaParticipantesPorProduto[], string>({
      query: (eventoId) => `/eventos/${eventoId}/estatisticas/participantes-por-produto`,
      providesTags: (result, error, eventoId) => [{ type: 'Participantes', id: eventoId }],
    }),
    obterEstatisticasPizza: builder.query<EstatisticaPizza[], string>({
      query: (eventoId) => `/eventos/${eventoId}/estatisticas/dayuse-retiro`,
      providesTags: (result, error, eventoId) => [{ type: 'Participantes', id: eventoId }],
    }),
    cadastrarEvento: builder.mutation<EventoDetalhes, CadastrarEventoRequest>({
      query: (data) => ({
        url: '/eventos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Eventos'],
    }),
    editarEvento: builder.mutation<EventoDetalhes, { eventoId: string; data: Partial<CadastrarEventoRequest> }>({
      query: ({ eventoId, data }) => ({
        url: `/eventos/${eventoId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { eventoId }) => [{ type: 'Eventos', id: eventoId }, 'Eventos'],
    }),
    cadastrarParticipante: builder.mutation<Participante, { eventId: string; data: ParticipanteRequest }>({
      query: ({ eventId, data }) => ({
        url: `/eventos/${eventId}/participantes`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'Participantes', id: eventId },
        { type: 'Participantes', id: `${eventId}-false` },
        { type: 'Participantes', id: `${eventId}-true` },
        { type: 'Eventos', id: eventId },
      ],
    }),
    excluirParticipante: builder.mutation<void, { eventoId: string; participanteId: string }>({
      query: ({ eventoId, participanteId }) => ({
        url: `/eventos/${eventoId}/participantes/${participanteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventoId }) => [
        { type: 'Participantes', id: eventoId },
        { type: 'Participantes', id: `${eventoId}-false` },
        { type: 'Participantes', id: `${eventoId}-true` },
        { type: 'Eventos', id: eventoId },
      ],
    }),
    editarParticipante: builder.mutation<Participante, { eventoId: string; participanteId: string; data: Partial<Participante> }>({
      query: ({ eventoId, participanteId, data }) => ({
        url: `/eventos/${eventoId}/participantes/${participanteId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { eventoId }) => [
        { type: 'Participantes', id: eventoId },
        { type: 'Participantes', id: `${eventoId}-false` },
        { type: 'Participantes', id: `${eventoId}-true` },
        { type: 'Eventos', id: eventoId },
      ],
    }),
  }),
});

export const {
  useListarEventosQuery,
  useObterEventoQuery,
  useListarParticipantesQuery,
  useObterEstatisticasParticipantesPorProdutoQuery,
  useObterEstatisticasPizzaQuery,
  useCadastrarEventoMutation,
  useEditarEventoMutation,
  useCadastrarParticipanteMutation,
  useExcluirParticipanteMutation,
  useEditarParticipanteMutation,
} = eventosApi;
