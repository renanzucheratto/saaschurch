'use client';

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';

  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    user: session?.user || null,
    loading,
    signOut,
    isAuthenticated: !!session,
    session,
  };
}
