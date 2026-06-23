'use client';

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/config/redux/slices/authSlice';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const loading = status === 'loading';

  const signOut = async () => {
    try {
      dispatch(logout());
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
