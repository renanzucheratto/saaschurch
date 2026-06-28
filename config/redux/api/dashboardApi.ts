import { baseApi } from './baseApi';

export interface DashboardStats {
  cards: {
    totalMembrosAtivos: number;
    eventosMes: number;
    eventosMesDescricao?: string;
    participantesMes: number;
  };
  crescimentoMembros: { mes: string; total: number }[];
  eventosPorMes: { mes: string; total: number }[];
  participacaoPorEvento: { eventoNome: string; total: number; status: string }[];
  membrosPorArea: { areaNome: string; total: number }[];
  projetosPorStatus: { status: string; total: number }[];
  proximosEventos: {
    id: string;
    nome: string;
    data_inicio: string;
    _count: { participantes: number };
  }[];
  ultimosMembros: {
    id: string;
    nome: string;
    email: string;
    createdAt: string;
    userType: string;
  }[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    obterDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useObterDashboardStatsQuery } = dashboardApi;
