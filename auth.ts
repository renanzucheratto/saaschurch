import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_URL}/auth/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.nome,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            userType: data.user.userType,
            instituicaoId: data.user.instituicaoId,
            telefone: data.user.telefone,
            rg: data.user.rg,
            cpf: data.user.cpf,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userType = user.userType;
        token.instituicaoId = user.instituicaoId;
        token.telefone = user.telefone;
        token.rg = user.rg;
        token.cpf = user.cpf;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.user.userType = token.userType;
        session.user.instituicaoId = token.instituicaoId;
        session.user.telefone = token.telefone;
        session.user.rg = token.rg;
        session.user.cpf = token.cpf;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authConfig);
