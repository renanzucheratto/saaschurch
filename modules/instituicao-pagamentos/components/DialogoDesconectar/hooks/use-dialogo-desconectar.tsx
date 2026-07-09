'use client';

import type { DialogoDesconectarProps } from '../../../types';

export function useDialogoDesconectar({ eventosAtivos }: DialogoDesconectarProps) {
  const aviso =
    eventosAtivos > 0
      ? `${eventosAtivos} evento(s) ativo(s) deixarão de aceitar pagamento online imediatamente.`
      : 'Nenhum evento ativo depende desta conexão no momento.';

  return {
    aviso,
    // Pagamentos já criados seguem seu ciclo no MP; a desconexão só barra os novos.
    ressalva: 'Os pagamentos já iniciados continuam sendo processados normalmente.',
  };
}
