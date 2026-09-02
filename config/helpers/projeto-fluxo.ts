import { StatusProjetoNome } from '@/types/projeto.types';

export type EtapaProjetoId = Exclude<StatusProjetoNome, 'recusado'>;

export interface EtapaProjeto {
  id: EtapaProjetoId;
  titulo: string;
  /** O que precisa acontecer enquanto o projeto está nesta etapa. */
  resumo: string;
  /** Quem age nesta etapa (texto exibido quando o usuário não pode agir). */
  responsavel: string;
  /** Texto curto usado quando a etapa já foi concluída. */
  concluido: string;
  icone: string;
}

export const ETAPAS_PROJETO: EtapaProjeto[] = [
  {
    id: 'em_analise',
    titulo: 'Em análise',
    resumo:
      'O backoffice está avaliando o projeto e o orçamento planejado. Enquanto isso você ainda pode editar as informações.',
    responsavel: 'o backoffice',
    concluido: 'Projeto avaliado pelo backoffice.',
    icone: 'material-symbols:pending-actions',
  },
  {
    id: 'aprovado',
    titulo: 'Aprovado',
    resumo:
      'Projeto liberado para execução. Compre os insumos e anexe as notas fiscais para poder solicitar o reembolso.',
    responsavel: 'o líder do projeto',
    concluido: 'Insumos comprados e notas fiscais anexadas.',
    icone: 'material-symbols:check-circle-outline',
  },
  {
    id: 'em_reembolso',
    titulo: 'Em reembolso',
    resumo:
      'O backoffice está conferindo as notas fiscais e realizando o pagamento. O comprovante do reembolso deve ser anexado.',
    responsavel: 'o backoffice',
    concluido: 'Reembolso pago e comprovante anexado.',
    icone: 'material-symbols:payments-outline',
  },
  {
    id: 'liquidado',
    titulo: 'Liquidado',
    resumo: 'Reembolso concluído. Falta apenas encerrar o projeto para arquivá-lo.',
    responsavel: 'o líder do projeto ou o backoffice',
    concluido: 'Reembolso conferido.',
    icone: 'material-symbols:task-alt',
  },
  {
    id: 'finalizado',
    titulo: 'Finalizado',
    resumo: 'Projeto encerrado. Nada mais é necessário.',
    responsavel: 'ninguém — o projeto está encerrado',
    concluido: 'Projeto encerrado.',
    icone: 'material-symbols:flag-circle-outline',
  },
];

export const getIndiceEtapa = (status?: StatusProjetoNome | null): number => {
  if (!status || status === 'recusado') return 0;
  const indice = ETAPAS_PROJETO.findIndex((etapa) => etapa.id === status);
  return indice === -1 ? 0 : indice;
};
