import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { signOut } from 'next-auth/react';
import type { RootState } from '../store';
import { logout, updateTokens } from '../slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST', body: { refresh_token: refreshToken } },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { session } = refreshResult.data as { session: { access_token: string; refresh_token: string } };
        api.dispatch(updateTokens({ accessToken: session.access_token, refreshToken: session.refresh_token }));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        await signOut({ redirect: false });
        window.location.href = '/login';
      }
    } else {
      api.dispatch(logout());
      await signOut({ redirect: false });
      window.location.href = '/login';
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Eventos',
    'Participantes',
    'Users',
    'Projetos',
    'Areas',
    'Me',
    'Dashboard',
    'Plano',
    'PagBank',
    'Assinatura',
    'OcorrenciasCalendario',
  ],
  endpoints: () => ({}),
});
