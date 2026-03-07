import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // baseUrl: 'https://saaschurch-api.vercel.app',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  }),
  tagTypes: ['Eventos', 'Participantes'],
  endpoints: () => ({}),
});
