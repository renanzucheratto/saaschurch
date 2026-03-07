export { ReduxProvider } from './provider';
export { store } from './store';
export type { RootState, AppDispatch } from './store';
export { baseApi } from './api/baseApi';
export { 
  eventosApi, 
  useListarEventosQuery,
  useObterEventoQuery,
  useCadastrarEventoMutation,
  useCadastrarParticipanteMutation,
  useListarParticipantesQuery
} from './api/eventosApi';
export type { 
  CadastrarEventoRequest, 
  CadastrarEventoResponse,
  ParticipanteRequest,
  ParticipanteResponse,
  ProdutoSelecionado,
  ProdutoEvento,
  Evento
} from './api/eventosApi';
