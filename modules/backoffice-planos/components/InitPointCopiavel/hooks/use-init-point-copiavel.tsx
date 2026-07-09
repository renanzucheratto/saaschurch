'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { InitPointCopiavelProps } from '../../../types';

const DURACAO_FEEDBACK_MS = 2000;

export function useInitPointCopiavel({ initPoint }: InitPointCopiavelProps) {
  const [copiado, setCopiado] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copiar = useCallback(async () => {
    await navigator.clipboard.writeText(initPoint);
    setCopiado(true);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiado(false), DURACAO_FEEDBACK_MS);
  }, [initPoint]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { copiado, copiar };
}
