import type { GridColDef } from '@mui/x-data-grid';

export const montarColunas = (): GridColDef[] => [
  { field: 'participante', headerName: 'Participante', flex: 1.4, minWidth: 180 },
  { field: 'valor', headerName: 'Valor', width: 130 },
  { field: 'applicationFee', headerName: 'Fee retido', width: 130 },
  { field: 'liquido', headerName: 'Líquido', width: 130 },
  { field: 'feePercentualAplicado', headerName: '% aplicado', width: 110 },
  { field: 'metodoPagamento', headerName: 'Método', width: 150 },
  { field: 'status', headerName: 'Status', width: 140 },
  { field: 'data', headerName: 'Data', width: 130 },
];
