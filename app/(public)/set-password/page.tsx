import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';

export default function Page() {
  return (
    <AuthLayout>
      <ResetPasswordForm 
        title="Seja bem-vindo!" 
        subtitle="Crie sua senha para acessar a plataforma pela primeira vez."
      />
    </AuthLayout>
  );
}
