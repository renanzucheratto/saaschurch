'use client';

import { Controller } from 'react-hook-form';
import { useEventoForm } from '../hooks/useEventoForm';
import { TextField, Checkbox, FormControlLabel, Button, Box, Typography } from '@mui/material';

export const EventoForm = () => {
  const { control, handleSubmit, errors, isSubmitting, isValid } = useEventoForm();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Formulário de Inscrição
      </Typography>

      <Controller
        name="nome"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nome"
            fullWidth
            error={!!errors.nome}
            helperText={errors.nome?.message}
          />
        )}
      />

      <Controller
        name="telefone"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Telefone"
            fullWidth
            error={!!errors.telefone}
            helperText={errors.telefone?.message}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />

      <Controller
        name="aceitarTermo"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value}
              />
            }
            label="Aceito os termos e condições"
          />
        )}
      />
      {errors.aceitarTermo && (
        <Typography color="error" variant="caption">
          {errors.aceitarTermo.message}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </Button>
    </Box>
  );
};
