import { baseApi } from './baseApi';
import {
  ProjetoListagem,
  ProjetoDetalhes,
  AnexoProjeto,
  StatusProjetoNome,
  TipoAnexo,
} from '@/types/projeto.types';

export interface ItemProjetoRequest {
  nome: string;
  descricao?: string | null;
  quantidade: number;
  valor_unit: number;
}

export interface CadastrarProjetoRequest {
  nome: string;
  descricao?: string | null;
  ideias?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  eventoId?: string | null;
  /** Áreas envolvidas. O backend sempre reinclui as áreas que o autor lidera. */
  areaIds: string[];
  itens: ItemProjetoRequest[];
}

export const projetosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listarProjetos: builder.query<ProjetoListagem[], void>({
      query: () => '/projetos',
      providesTags: ['Projetos'],
    }),
    obterProjeto: builder.query<ProjetoDetalhes, string>({
      query: (projetoId) => `/projetos/${projetoId}`,
      providesTags: (result, error, projetoId) => [{ type: 'Projetos', id: projetoId }],
    }),
    cadastrarProjeto: builder.mutation<ProjetoDetalhes, CadastrarProjetoRequest>({
      query: (data) => ({
        url: '/projetos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Projetos'],
    }),
    editarProjeto: builder.mutation<
      ProjetoDetalhes,
      { projetoId: string; data: Partial<CadastrarProjetoRequest> }
    >({
      query: ({ projetoId, data }) => ({
        url: `/projetos/${projetoId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { projetoId }) => [
        { type: 'Projetos', id: projetoId },
        'Projetos',
      ],
    }),
    alterarStatusProjeto: builder.mutation<
      ProjetoDetalhes,
      { projetoId: string; nome: StatusProjetoNome; justificativa?: string | null }
    >({
      query: ({ projetoId, nome, justificativa }) => ({
        url: `/projetos/${projetoId}/status`,
        method: 'PUT',
        body: { nome, justificativa },
      }),
      invalidatesTags: (result, error, { projetoId }) => [
        { type: 'Projetos', id: projetoId },
        'Projetos',
      ],
    }),
    uploadAnexoProjeto: builder.mutation<
      AnexoProjeto,
      { projetoId: string; tipo: TipoAnexo; arquivo: File }
    >({
      query: ({ projetoId, tipo, arquivo }) => {
        const formData = new FormData();
        formData.append('tipo', tipo);
        formData.append('arquivo', arquivo);
        return {
          url: `/projetos/${projetoId}/anexos`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { projetoId }) => [{ type: 'Projetos', id: projetoId }],
    }),
    removerAnexoProjeto: builder.mutation<
      { message: string },
      { projetoId: string; anexoId: string }
    >({
      query: ({ projetoId, anexoId }) => ({
        url: `/projetos/${projetoId}/anexos/${anexoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projetoId }) => [{ type: 'Projetos', id: projetoId }],
    }),
  }),
});

export const {
  useListarProjetosQuery,
  useObterProjetoQuery,
  useCadastrarProjetoMutation,
  useEditarProjetoMutation,
  useAlterarStatusProjetoMutation,
  useUploadAnexoProjetoMutation,
  useRemoverAnexoProjetoMutation,
} = projetosApi;
