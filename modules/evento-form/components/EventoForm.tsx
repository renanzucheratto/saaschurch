'use client';

import { Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { useEventoForm } from '../hooks/useEventoForm';
import { TextField, Checkbox, FormControlLabel, Button, Box, Typography, Snackbar, Alert, CircularProgress, Container, useMediaQuery, useTheme, Stack } from '@mui/material';
import { useObterEventoQuery } from '@/config/redux';
import { usePathname } from 'next/navigation';
import { ProductAccordion } from './ProductAccordion';
import React from 'react';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(00) 00000-0000"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(value: unknown, _mask: unknown, event?: Event) => {
          if (event) onChange({ target: { name: props.name, value: value as string } });
        }}
      />
    );
  },
);

const CPFMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function CPFMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="000.000.000-00"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(value: unknown, _mask: unknown, event?: Event) => {
          if (event) onChange({ target: { name: props.name, value: value as string } });
        }}
      />
    );
  },
);

const RGMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function RGMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00.000.000-0"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(value: unknown, _mask: unknown, event?: Event) => {
          if (event) onChange({ target: { name: props.name, value: value as string } });
        }}
      />
    );
  },
);

export const EventoForm = () => {
  const params = usePathname();
  const eventoId = params?.split('/').pop() ?? '';

  const { data: evento, isLoading: isLoadingEvento } = useObterEventoQuery(eventoId);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const hasProdutos = !!(evento?.produtos && evento.produtos.length > 0);
  const selecaoUnicaProduto = evento?.selecao_unica_produto;
  const { control, handleSubmit, errors, isSubmitting, isValid, alert, handleCloseAlert } = useEventoForm(eventoId, hasProdutos, selecaoUnicaProduto);

  if (isLoadingEvento) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!evento) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h5" color="error">
          Evento não encontrado
        </Typography>
      </Container>
    );
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
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
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f8f9fa', overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '35fr 65fr' }, width: '100%', height: '100%' }}>
        <Box
          sx={{
            ...(evento.imagem_url ? { backgroundImage: `url(${evento.imagem_url})` } : { backgroundColor: 'rgba(81, 59, 137, 1)' }),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            p: 6,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            height: '100vh',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000724bc',
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: { lg: '3rem', xl: '3.5rem' },
                lineHeight: 1.2,
                mb: 3,
                letterSpacing: '-0.02em',
              }}
            >
              {evento.nome}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: '1.1rem',
              }}
            >
              {evento.descricao || 'Participe deste evento incrível e faça parte de uma experiência única.'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  📅
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Data de Início
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {formatDateTime(evento.data_inicio)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  🏁
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Data de Término
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {formatDateTime(evento.data_fim)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            overflowY: 'auto',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 900,
              p: 2,
            }}
          >

            <Box component="form" onSubmit={handleSubmit}>
              <Stack mb={4}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {isMobile ? evento.nome : 'Inscreva-se no evento'}
                </Typography >
                {evento.descricao && isMobile ?
                  <Typography variant="body2" mb={1}>
                    {evento.descricao}
                  </Typography>
                  : null}
                <Typography variant="body2">
                  Preencha os dados abaixo para garantir sua participação
                </Typography>
              </Stack>

              {hasProdutos && (
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: 'text.primary',
                    }}
                  >
                    Selecione uma opção {selecaoUnicaProduto ? '*' : '(opcional)'}
                  </Typography>
                  <Controller
                    name="produtoId"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          {evento.produtos.map((produto) => (
                            <ProductAccordion
                              key={produto.id}
                              produto={produto}
                              selected={field.value === produto.id}
                              onSelect={field.onChange}
                              hasSelection={!!field.value}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  />
                  {errors.produtoId && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                      {errors.produtoId.message}
                    </Typography>
                  )}
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome completo"
                      fullWidth
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: '#fafafa',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          },
                          '&.Mui-focused': {
                            bgcolor: 'white',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                        },
                      }}
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
                      variant="outlined"
                      placeholder="(00) 00000-0000"
                      InputProps={{
                        inputComponent: TextMaskCustom as never,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: '#fafafa',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          },
                          '&.Mui-focused': {
                            bgcolor: 'white',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                        },
                      }}
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
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: '#fafafa',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          },
                          '&.Mui-focused': {
                            bgcolor: 'white',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="rg"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="RG"
                      fullWidth
                      error={!!errors.rg}
                      helperText={errors.rg?.message}
                      variant="outlined"
                      placeholder="00.000.000-0"
                      InputProps={{
                        inputComponent: RGMaskCustom as never,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: '#fafafa',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          },
                          '&.Mui-focused': {
                            bgcolor: 'white',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CPF"
                      fullWidth
                      error={!!errors.cpf}
                      helperText={errors.cpf?.message}
                      variant="outlined"
                      placeholder="000.000.000-00"
                      InputProps={{
                        inputComponent: CPFMaskCustom as never,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: '#fafafa',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          },
                          '&.Mui-focused': {
                            bgcolor: 'white',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.95rem',
                        },
                      }}
                    />
                  )}
                />

                <Box sx={{ mt: 2 }}>
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
                        label={
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            Eu declaro estar ciente e concordar com as condições contidas neste formulário de inscrição da Igreja Formosa de Cristo, bem como a responsabilidade do cumprimento com o pagamento do valor escolhido
                          </Typography>
                        }
                      />
                    )}
                  />
                  {errors.termo_assinado && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', ml: 4 }}>
                      {errors.termo_assinado.message}
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!isValid || isSubmitting}
                  sx={{
                    mb: 6,
                    py: 1.5,
                    borderRadius: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    bgcolor: '#1a1a1a',
                    color: 'white',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#000000',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    '&:disabled': {
                      bgcolor: '#e0e0e0',
                      color: '#9e9e9e',
                    },
                  }}
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Inscrição'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

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
