import { baseApi } from './baseApi';

export interface CadastrarEventoRequest {
  nome: string;
  data_inicio: string;
  data_fim: string;
  descricao?: string;
}

export interface CadastrarEventoResponse {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  descricao?: string;
  created_at: string;
}

export interface ParticipanteRequest {
  nome: string;
  email: string;
  telefone: string;
  termo_assinado: boolean;
}

export interface ParticipanteResponse {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  termo_assinado: boolean;
  evento_id: string;
  created_at: string;
}

export interface Evento {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  descricao?: string;
  created_at: string;
}

export const eventosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarEventos: builder.query<Evento[], void>({
      query: () => '/eventos',
      providesTags: ['Eventos'],
    }),
    obterEvento: builder.query<Evento, string>({
      query: (eventoId) => `/eventos/${eventoId}`,
      providesTags: ['Eventos'],
    }),
    cadastrarEvento: builder.mutation<CadastrarEventoResponse, CadastrarEventoRequest>({
      query: (data) => ({
        url: '/eventos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Eventos'],
    }),
    cadastrarParticipante: builder.mutation<ParticipanteResponse, { eventId: string; data: ParticipanteRequest }>({
      query: ({ eventId, data }) => ({
        url: `/eventos/${eventId}/participantes`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Participantes'],
    }),
    listarParticipantes: builder.query<ParticipanteResponse[], string>({
      query: (eventoId) => `/eventos/${eventoId}/participantes`,
      providesTags: ['Participantes'],
    }),
  }),
});

export const { 
  useListarEventosQuery,
  useObterEventoQuery,
  useCadastrarEventoMutation,
  useCadastrarParticipanteMutation,
  useListarParticipantesQuery
} = eventosApi;
