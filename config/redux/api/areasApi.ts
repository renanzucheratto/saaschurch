import { baseApi } from './baseApi';
import { Area, RoleNaArea } from '@/types/area.types';

export const areasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarAreas: builder.query<Area[], void>({
      query: () => '/areas',
      providesTags: ['Areas'],
    }),
    buscarArea: builder.query<Area, string>({
      query: (id) => `/areas/${id}`,
      providesTags: (result, error, id) => [{ type: 'Areas', id }],
    }),
    criarArea: builder.mutation<Area, { nome: string }>({
      query: (body) => ({ url: '/areas', method: 'POST', body }),
      invalidatesTags: ['Areas'],
    }),
    atualizarArea: builder.mutation<Area, { id: string; nome: string }>({
      query: ({ id, ...body }) => ({ url: `/areas/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => ['Areas', { type: 'Areas', id }],
    }),
    removerArea: builder.mutation<void, string>({
      query: (id) => ({ url: `/areas/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Areas', 'Me'],
    }),
    adicionarMembro: builder.mutation<void, { areaId: string; userId: string; roleNaArea: RoleNaArea }>({
      query: ({ areaId, ...body }) => ({
        url: `/areas/${areaId}/membros`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { areaId }) => [{ type: 'Areas', id: areaId }, 'Areas'],
    }),
    atualizarPapel: builder.mutation<void, { areaId: string; userId: string; roleNaArea: RoleNaArea }>({
      query: ({ areaId, userId, ...body }) => ({
        url: `/areas/${areaId}/membros/${userId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { areaId }) => [{ type: 'Areas', id: areaId }, 'Areas', 'Me'],
    }),
    removerMembro: builder.mutation<void, { areaId: string; userId: string }>({
      query: ({ areaId, userId }) => ({
        url: `/areas/${areaId}/membros/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { areaId }) => [{ type: 'Areas', id: areaId }, 'Areas', 'Me'],
    }),
  }),
});

export const {
  useListarAreasQuery,
  useBuscarAreaQuery,
  useCriarAreaMutation,
  useAtualizarAreaMutation,
  useRemoverAreaMutation,
  useAdicionarMembroMutation,
  useAtualizarPapelMutation,
  useRemoverMembroMutation,
} = areasApi;
