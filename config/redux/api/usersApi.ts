import { baseApi } from './baseApi';

export interface User {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  rg?: string;
  cpf?: string;
  userType: 'membro' | 'backoffice';
  instituicaoId: string;
  instituicao?: {
    id: string;
    nome: string;
  };
  createdAt: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarUsuarios: builder.query<User[], { instituicaoId?: string; userType?: string } | void>({
      query: (params) => ({
        url: '/users',
        params: params || undefined,
      }),
      providesTags: ['Users'],
    }),
    buscarUsuario: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users', id }],
    }),
    criarUsuario: builder.mutation<any, Partial<User>>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    atualizarUsuario: builder.mutation<any, { id: string } & Partial<User>>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Users', { type: 'Users', id }],
    }),
    excluirUsuario: builder.mutation<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useListarUsuariosQuery,
  useBuscarUsuarioQuery,
  useCriarUsuarioMutation,
  useAtualizarUsuarioMutation,
  useExcluirUsuarioMutation,
} = usersApi;
