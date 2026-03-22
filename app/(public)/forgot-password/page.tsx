import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';

export default function Page() {
  return (
    <AuthLayout>
      <ResetPasswordForm 
        title="Nova senha" 
        subtitle="Crie uma nova senha para acessar sua conta."
      />
    </AuthLayout>
  );
}
