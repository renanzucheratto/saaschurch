'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Link as MuiLink,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useSignIn } from '../hooks/useSignIn';

export function SignInForm() {
  const { register, handleSubmit, errors, onSubmit, isLoading, error } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

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
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#1a1a2e',
            fontSize: '2.5rem',
            lineHeight: 1.2,
            mb: 1,
          }}
        >
          Olá,
          <br />
          Bem-vindo de volta
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('email')}
        label="Email"
        type="email"
        fullWidth
        error={!!errors.email}
        helperText={errors.email?.message}
        placeholder="seu@email.com"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#f8f9fa',
          },
        }}
      />

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
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#f8f9fa',
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        
        <MuiLink
          href="/reset-password"
          sx={{
            fontSize: '0.875rem',
            color: '#666',
            textDecoration: 'none',
            '&:hover': {
              color: '#6366f1',
            },
          }}
        >
          Esqueci minha senha
        </MuiLink>
      </Box>

      <Button
        type="submit"
        fullWidth
        disabled={isLoading}
        sx={{
          mt: 1,
          py: 1.5,
          backgroundColor: '#6366f1',
          borderRadius: 2,
          textTransform: 'none',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#4f46e5',
          },
          '&:disabled': {
            backgroundColor: '#6366f1',
            opacity: 0.7,
          },
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Entrar'
        )}
      </Button>
    </Box>
  );
}
