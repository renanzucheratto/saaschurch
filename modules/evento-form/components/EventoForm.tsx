'use client';

import { Controller } from 'react-hook-form';
import { useEventoForm } from '../hooks/useEventoForm';
import { TextField, Checkbox, FormControlLabel, Button, Box, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useObterEventoQuery } from '@/config/redux';
import { usePathname } from 'next/navigation';

export const EventoForm = () => {
  const params = usePathname();
  const eventoId = params?.split('/').pop() ?? '';

  const { control, handleSubmit, errors, isSubmitting, isValid, alert, handleCloseAlert } = useEventoForm(eventoId);
  const { data: evento, isLoading: isLoadingEvento } = useObterEventoQuery(eventoId);

  if (isLoadingEvento) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!evento) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Typography variant="h5" color="error">
          Evento não encontrado
        </Typography>
      </Box>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeFormatted = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateFormatted} às ${timeFormatted}`;
  };

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
        {evento.nome}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          <strong>Data de início:</strong> {formatDateTime(evento.data_inicio)}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          <strong>Data de término:</strong> {formatDateTime(evento.data_fim)}
        </Typography>
        {evento.descricao && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Descrição:</strong> {evento.descricao}
          </Typography>
        )}
      </Box>

      <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 2 }}>
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
        name="termo_assinado"
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
      {errors.termo_assinado && (
        <Typography color="error" variant="caption">
          {errors.termo_assinado.message}
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

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
