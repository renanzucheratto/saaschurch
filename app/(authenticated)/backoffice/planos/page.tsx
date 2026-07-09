import { CanAccess } from '@/components/CanAccess';
import { BackofficePlanos } from '@/modules/backoffice-planos';

export default function BackofficePlanosPage() {
  return (
    <CanAccess roles={['backoffice']} fallback={<p>Acesso negado.</p>}>
      <BackofficePlanos />
    </CanAccess>
  );
}
