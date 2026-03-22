'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { requestResetSchema, RequestResetFormData } from '../schemas/auth.schema';

export function RequestResetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: RequestResetFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao enviar email');
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
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Verifique seu email</Typography>
        <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
          Enviamos um link de recuperação para o seu email.
        </Typography>
        <MuiLink href="/login" sx={{ textDecoration: 'none', fontWeight: 600, color: '#6366f1' }}>
          Voltar para o login
        </MuiLink>
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
          Recuperar senha
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Informe seu email para receber o link de troca de senha.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        {...register('email')}
        label="Email"
        fullWidth
        error={!!errors.email}
        helperText={errors.email?.message}
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
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Enviar link'}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <MuiLink href="/login" sx={{ fontSize: '0.875rem', color: '#666', textDecoration: 'none', '&:hover': { color: '#6366f1' } }}>
          Voltar para o login
        </MuiLink>
      </Box>
    </Box>
  );
}
