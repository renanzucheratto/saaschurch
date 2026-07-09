'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PixQrCodeProps } from '../../../types';

const UM_SEGUNDO = 1000;

function formatarRestante(ms: number): string {
  const totalSegundos = Math.max(0, Math.floor(ms / UM_SEGUNDO));
  const minutos = String(Math.floor(totalSegundos / 60)).padStart(2, '0');
  const segundos = String(totalSegundos % 60).padStart(2, '0');

  return `${minutos}:${segundos}`;
}

export function usePixQrCode({ pix, expirado }: PixQrCodeProps) {
  const [restante, setRestante] = useState('--:--');
  const [copiado, setCopiado] = useState(false);
  const timerCopia = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pix.expiraEm || expirado) return;

    const alvo = new Date(pix.expiraEm).getTime();

    const atualizar = () => setRestante(formatarRestante(alvo - Date.now()));

    atualizar();
    const intervalo = setInterval(atualizar, UM_SEGUNDO);

    return () => clearInterval(intervalo);
  }, [pix.expiraEm, expirado]);

  useEffect(() => () => { if (timerCopia.current) clearTimeout(timerCopia.current); }, []);

  const copiar = useCallback(async () => {
    await navigator.clipboard.writeText(pix.qrCode);
    setCopiado(true);

    if (timerCopia.current) clearTimeout(timerCopia.current);
    timerCopia.current = setTimeout(() => setCopiado(false), 2000);
  }, [pix.qrCode]);

  return {
    restante,
    copiado,
    copiar,
    imagem: pix.qrCodeBase64 ? `data:image/png;base64,${pix.qrCodeBase64}` : null,
  };
}
