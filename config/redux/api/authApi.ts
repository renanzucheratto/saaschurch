import { baseApi } from './baseApi';

export interface SignUpData {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
  rg?: string;
  cpf?: string;
  userType: 'membro' | 'backoffice';
  instituicaoId: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  rg?: string;
  cpf?: string;
  userType: 'membro' | 'backoffice';
  instituicaoId: string;
  instituicao: {
    id: string;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
}

export interface UpdateUserData {
  nome?: string;
  telefone?: string;
  rg?: string;
  cpf?: string;
  email?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation<{ user: AuthUser }, SignUpData>({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
    }),
    signIn: builder.mutation<AuthResponse, SignInData>({
      query: (data) => ({
        url: '/auth/signin',
        method: 'POST',
        body: data,
      }),
    }),
    signOut: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/signout',
        method: 'POST',
      }),
    }),
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
    refreshToken: builder.mutation<{ session: AuthSession }, { refresh_token: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),
    updateUser: builder.mutation<{ user: AuthUser }, UpdateUserData>({
      query: (data) => ({
        url: '/auth/me',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useUpdateUserMutation,
} = authApi;
