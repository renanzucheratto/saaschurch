import { baseApi } from './baseApi';
import { OcorrenciaCalendario, OcorrenciaHorarioExcecao } from '@/types/ocorrencia-calendario.types';

export interface CriarOcorrenciaRequest {
  titulo: string;
  nota?: string | null;
  dataInicio: string;
  dataFim: string;
  horaInicioDefault: string;
  horaFimDefault: string;
  areaIds: string[];
  excecoes?: OcorrenciaHorarioExcecao[];
}

export const ocorrenciasCalendarioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarOcorrencias: builder.query<OcorrenciaCalendario[], void>({
      query: () => '/ocorrencias-calendario',
      providesTags: ['OcorrenciasCalendario'],
    }),
    buscarOcorrencia: builder.query<OcorrenciaCalendario, string>({
      query: (id) => `/ocorrencias-calendario/${id}`,
      providesTags: (result, error, id) => [{ type: 'OcorrenciasCalendario', id }],
    }),
    criarOcorrencia: builder.mutation<OcorrenciaCalendario, CriarOcorrenciaRequest>({
      query: (body) => ({ url: '/ocorrencias-calendario', method: 'POST', body }),
      invalidatesTags: ['OcorrenciasCalendario'],
    }),
    atualizarOcorrencia: builder.mutation<OcorrenciaCalendario, { id: string } & CriarOcorrenciaRequest>({
      query: ({ id, ...body }) => ({ url: `/ocorrencias-calendario/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => ['OcorrenciasCalendario', { type: 'OcorrenciasCalendario', id }],
    }),
    removerOcorrencia: builder.mutation<void, string>({
      query: (id) => ({ url: `/ocorrencias-calendario/${id}`, method: 'DELETE' }),
      invalidatesTags: ['OcorrenciasCalendario'],
    }),
  }),
});

export const {
  useListarOcorrenciasQuery,
  useBuscarOcorrenciaQuery,
  useCriarOcorrenciaMutation,
  useAtualizarOcorrenciaMutation,
  useRemoverOcorrenciaMutation,
} = ocorrenciasCalendarioApi;
