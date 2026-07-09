import { Suspense } from 'react';
import { CanAccess } from '@/components/CanAccess';
import { InstituicaoPagamentos } from '@/modules/instituicao-pagamentos';

export default function InstituicaoPagamentosPage() {
  return (
    <CanAccess feature="conectarMercadoPago" fallback={<p>Acesso negado.</p>}>
      {/* `useSearchParams` exige um limite de Suspense no App Router. */}
      <Suspense fallback={null}>
        <InstituicaoPagamentos />
      </Suspense>
    </CanAccess>
  );
}
