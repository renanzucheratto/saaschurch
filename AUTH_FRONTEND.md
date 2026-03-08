# Autenticação no Frontend - SaasChurch

Este documento descreve como usar o sistema de autenticação no frontend Next.js.

## Estrutura

O sistema de autenticação do frontend é composto por:

1. **API Client** (`lib/api/auth.ts`) - Funções para comunicação com a API
2. **Hook useAuth** (`lib/hooks/useAuth.ts`) - Hook React para gerenciar autenticação
3. **Middleware** (`middleware.ts`) - Proteção de rotas no Next.js

## Configuração

### 1. Variável de Ambiente

Crie ou atualize o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Para produção:
```env
NEXT_PUBLIC_API_URL=https://sua-api.vercel.app
```

## Uso do Hook useAuth

### Importação

```typescript
import { useAuth } from '@/lib/hooks/useAuth';
```

### Exemplo de Uso

```typescript
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <div>Não autenticado</div>;
  }

  return (
    <div>
      <h1>Bem-vindo, {user.nome}</h1>
      <p>Email: {user.email}</p>
      <p>Instituição: {user.instituicao.nome}</p>
      <p>Tipo: {user.userType}</p>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

## Funções Disponíveis

### `useAuth()`

Retorna:
- `user` - Dados do usuário autenticado ou null
- `loading` - Boolean indicando se está carregando
- `signIn(data)` - Função para fazer login
- `signUp(data)` - Função para criar conta
- `signOut()` - Função para fazer logout
- `refreshUser()` - Função para atualizar dados do usuário
- `isAuthenticated` - Boolean indicando se está autenticado

### Exemplo de Login

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Entrar</button>
    </form>
  );
}
```

### Exemplo de Cadastro

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    telefone: '',
    instituicaoId: '',
  });
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signUp({
        ...formData,
        userType: 'membro',
      });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        placeholder="Nome completo"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Senha"
        required
      />
      <input
        type="tel"
        value={formData.telefone}
        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
        placeholder="Telefone"
      />
      <select
        value={formData.instituicaoId}
        onChange={(e) => setFormData({ ...formData, instituicaoId: e.target.value })}
        required
      >
        <option value="">Selecione sua igreja</option>
        {/* Carregar lista de instituições */}
      </select>
      {error && <p className="error">{error}</p>}
      <button type="submit">Criar conta</button>
    </form>
  );
}
```

## Middleware de Proteção de Rotas

O middleware em `middleware.ts` protege automaticamente as rotas:

- Rotas públicas: `/`, `/login`, `/signup`
- Rotas protegidas: Todas as outras rotas requerem autenticação
- Redirecionamento automático: Usuários não autenticados são redirecionados para `/login`
- Usuários autenticados tentando acessar `/login` ou `/signup` são redirecionados para `/dashboard`

### Personalizar Rotas Públicas

Edite o array `publicPaths` em `middleware.ts`:

```typescript
const publicPaths = ['/login', '/signup', '/', '/about', '/contact'];
```

## Funções da API (Uso Direto)

Se precisar usar as funções da API diretamente (sem o hook):

```typescript
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  updateUser,
  refreshToken,
  getStoredUser,
  getStoredToken,
  isAuthenticated,
} from '@/lib/api/auth';

// Login
const { user, session } = await signIn({
  email: 'user@example.com',
  password: 'password123',
});

// Cadastro
const { user } = await signUp({
  email: 'user@example.com',
  password: 'password123',
  nome: 'Nome do Usuário',
  userType: 'membro',
  instituicaoId: 'uuid-da-instituicao',
});

// Logout
await signOut();

// Buscar usuário atual
const user = await getCurrentUser();

// Atualizar usuário
const { user: updatedUser } = await updateUser({
  nome: 'Novo Nome',
  telefone: '11999999999',
});

// Renovar token
const success = await refreshToken();

// Verificar autenticação
const isAuth = isAuthenticated();

// Obter usuário armazenado
const storedUser = getStoredUser();

// Obter token armazenado
const token = getStoredToken();
```

## Armazenamento

O sistema usa `localStorage` para armazenar:
- `access_token` - Token de acesso JWT
- `refresh_token` - Token para renovação
- `user` - Dados do usuário (JSON)

E `cookies` para:
- `access_token` - Token usado pelo middleware do Next.js

## Tipos TypeScript

```typescript
interface AuthUser {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  userType: 'membro' | 'backoffice';
  instituicaoId: string;
  instituicao: {
    id: string;
    nome: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
  userType: 'membro' | 'backoffice';
  instituicaoId: string;
}
```

## Proteção de Componentes

### Componente de Proteção

```typescript
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

### Proteção por Tipo de Usuário

```typescript
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export function BackofficeOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user || user.userType !== 'backoffice') {
    return <div>Acesso negado. Apenas para administradores.</div>;
  }

  return <>{children}</>;
}
```

## Renovação Automática de Token

O sistema tenta renovar o token automaticamente quando:
- O token expira
- Uma requisição retorna 401 Unauthorized

A renovação é feita usando o `refresh_token` armazenado.

## Boas Práticas

1. Sempre use o hook `useAuth` em componentes React
2. Use as funções da API diretamente apenas em casos especiais
3. Não armazene dados sensíveis no localStorage além do necessário
4. Implemente logout em caso de erro 401 persistente
5. Valide o tipo de usuário antes de mostrar funcionalidades restritas
6. Use o middleware para proteção de rotas sempre que possível
