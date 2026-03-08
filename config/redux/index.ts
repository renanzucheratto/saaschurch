export { ReduxProvider } from './provider';
export { store } from './store';
export type { RootState, AppDispatch } from './store';
export { baseApi } from './api/baseApi';
export { 
  authApi,
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useUpdateUserMutation,
} from './api/authApi';
export type {
  SignUpData,
  SignInData,
  AuthUser,
  AuthSession,
  AuthResponse,
  UpdateUserData,
} from './api/authApi';
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
