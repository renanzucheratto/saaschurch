export interface PagamentosTabProps {
  eventoId: string;
}

export interface LinhaPagamento {
  id: string;
  participante: string;
  valor: string;
  applicationFee: string;
  liquido: string;
  feePercentualAplicado: string;
  metodoPagamento: string;
  status: string;
  data: string | null;
}
