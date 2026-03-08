const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SignUpData {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
  rg?: string;
  cpf?: string;
  userType: 'membro' | 'backoffice';
  instituicaoId: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  rg?: string;
  cpf?: string;
  userType: 'membro' | 'backoffice';
  instituicaoId: string;
  instituicao: {
    id: string;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
}

export async function signUp(data: SignUpData): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar usuário');
  }

  return response.json();
}

export async function signIn(data: SignInData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao fazer login');
  }

  const authData = await response.json();
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', authData.session.access_token);
    localStorage.setItem('refresh_token', authData.session.refresh_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  return authData;
}

export async function signOut(): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (token) {
    try {
      await fetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          return getCurrentUser();
        }
      }
      return null;
    }

    const user = await response.json();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

export async function refreshToken(): Promise<boolean> {
  const refresh_token = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

  if (!refresh_token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token }),
    });

    if (!response.ok) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      return false;
    }

    const { session } = await response.json();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', session.access_token);
      localStorage.setItem('refresh_token', session.refresh_token);
    }

    return true;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return false;
  }
}

export async function updateUser(data: {
  nome?: string;
  telefone?: string;
  rg?: string;
  cpf?: string;
  email?: string;
}): Promise<{ user: AuthUser }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao atualizar usuário');
  }

  const result = await response.json();
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(result.user));
  }

  return result;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('access_token');
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
