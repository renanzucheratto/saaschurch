import { baseApi } from './baseApi';
import { EventoListagem, EventoDetalhes, Participante, Produto } from '@/types/evento.types';

export interface CadastrarEventoRequest {
  nome: string;
  data_inicio: string;
  data_fim: string;
  descricao?: string;
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
  termo_assinado: boolean;
  produtos_selecionados: ProdutoSelecionado[];
}

export interface EstatisticaParticipantesPorProduto {
  produtoId: string;
  produtoNome: string;
  quantidadeParticipantes: number;
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
      query: ({ eventoId, isDeleted }) => `/eventos/${eventoId}/participantes?isDeleted=${!!isDeleted}`,
      providesTags: (result, error, { eventoId, isDeleted }) => [
        { type: 'Participantes', id: `${eventoId}-${isDeleted}` }
      ],
    }),
    obterEstatisticasParticipantesPorProduto: builder.query<EstatisticaParticipantesPorProduto[], string>({
      query: (eventoId) => `/eventos/${eventoId}/estatisticas/participantes-por-produto`,
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
  useCadastrarEventoMutation,
  useCadastrarParticipanteMutation,
  useExcluirParticipanteMutation,
  useEditarParticipanteMutation,
} = eventosApi;
