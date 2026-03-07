import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // baseUrl: 'https://saaschurch-api.vercel.app',
    baseUrl: 'http://localhost:3000',
  }),
  tagTypes: ['Eventos', 'Participantes'],
  endpoints: () => ({}),
});
