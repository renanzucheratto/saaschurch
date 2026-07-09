export interface DialogoDesconectarProps {
  aberto: boolean;
  eventosAtivos: number;
  desconectando: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
}
