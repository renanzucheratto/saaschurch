'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/auth.schema';

export function ResetPasswordForm({ title = 'Definir nova senha', subtitle = 'Preencha os campos abaixo para cadastrar sua nova senha.' }: { title?: string, subtitle?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // O token de acesso fica no hash do URL (#access_token=...) para fluxos de recuperação/convite do Supabase
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');

      if (!accessToken) {
        throw new Error('Token de autenticação não encontrado. Por favor, utilize o link recebido por email.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password: data.password }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao atualizar senha');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Senha cadastrada!</Typography>
        <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
          Sua senha foi redefinida com sucesso. Agora você já pode acessar sua conta.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={() => router.push('/login')}
          sx={{
            py: 1.5,
            backgroundColor: '#6366f1',
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': { backgroundColor: '#4f46e5' },
          }}
        >
          Ir para o Login
        </Button>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          {subtitle}
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        {...register('password')}
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        error={!!errors.password}
        helperText={errors.password?.message}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#f8f9fa' } }}
      />

      <TextField
        {...register('confirmPassword')}
        label="Confirmar senha"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#f8f9fa' } }}
      />

      <Button
        type="submit"
        fullWidth
        disabled={isLoading}
        sx={{
          py: 1.5,
          backgroundColor: '#6366f1',
          borderRadius: 2,
          color: '#fff',
          textTransform: 'none',
          fontSize: '1rem',
          '&:hover': { backgroundColor: '#4f46e5' },
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Redefinir senha'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <MuiLink href="/login" sx={{ fontSize: '0.875rem', color: '#666', textDecoration: 'none', '&:hover': { color: '#6366f1' } }}>
          Voltar para o login
        </MuiLink>
      </Box>
    </Box>
  );
}
