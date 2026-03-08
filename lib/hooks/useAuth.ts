import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getCurrentUser,
  getStoredUser,
  isAuthenticated as checkAuth,
  type AuthUser,
  type SignInData,
  type SignUpData,
} from '../api/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (data: SignInData) => {
    try {
      const response = await apiSignIn(data);
      setUser(response.user);
      
      if (typeof window !== 'undefined') {
        document.cookie = `access_token=${response.session.access_token}; path=/; max-age=${response.session.expires_in}`;
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const response = await apiSignUp(data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiSignOut();
      setUser(null);
      
      if (typeof window !== 'undefined') {
        document.cookie = 'access_token=; path=/; max-age=0';
      }
      
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  };

  const isAuthenticated = checkAuth();

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
    isAuthenticated,
  };
}
