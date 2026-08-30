import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Feriado {
  date: string;
  name: string;
  type: string;
}

export const feriadosApi = createApi({
  reducerPath: 'feriadosApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://brasilapi.com.br/api/feriados/v1' }),
  endpoints: (builder) => ({
    listarFeriados: builder.query<Feriado[], number>({
      query: (ano) => `/${ano}`,
    }),
  }),
});

export const { useListarFeriadosQuery } = feriadosApi;
