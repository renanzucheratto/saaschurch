import { RequestResetForm } from '@/modules/auth/components/RequestResetForm';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';

export default function Page() {
  return (
    <AuthLayout>
      <RequestResetForm />
    </AuthLayout>
  );
}
