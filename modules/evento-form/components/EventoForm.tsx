'use client';

import { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { useEventoForm } from '../hooks/useEventoForm';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Stack,
  Divider,
} from '@mui/material';
import { useObterEventoQuery } from '@/config/redux';
import { usePathname } from 'next/navigation';
import { ProductAccordion } from './ProductAccordion';
import { CampoRenderer } from './CampoRenderer';
import { Countdown } from './Countdown';
import { CPFMaskCustom, RGMaskCustom, TelefoneMaskCustom } from './MaskInputs';
import { FaqSection } from './FaqSection';
import { Icon } from "@iconify/react";

const BRAND = '#513B89';

export const EventoForm = () => {
  const params = usePathname();
  const eventoId = params?.split('/').pop() ?? '';
  const formRef = useRef<HTMLDivElement>(null);

  const { data: evento, isLoading: isLoadingEvento } = useObterEventoQuery(eventoId);

  const hasProdutos = !!(evento?.produtos && evento.produtos.length > 0);
  const selecaoUnicaProduto = evento?.selecao_unica_produto;
  const statusEvento = evento?.statusAtual ?? evento?.status ?? null;
  const isRegistrationOpen = statusEvento?.nome === 'aberto';
  const campos = evento?.campos_customizados ?? [];
  const temCamposCustomizados = campos.length > 0;
  const camposVisiveis = campos.filter((c) => !c.oculto);

  const { control, handleSubmit, errors, isSubmitting, isValid, alert, handleCloseAlert } =
    useEventoForm(eventoId, hasProdutos, selecaoUnicaProduto, isRegistrationOpen, campos);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const d = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const t = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${d} às ${t}`;
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoadingEvento) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} sx={{ color: BRAND }} />
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

  const dataInicio = formatDateTime(evento.data_inicio);
  const statusMensagem =
    statusEvento?.nome === 'aberto'
      ? 'As inscrições estão abertas.'
      : statusEvento?.justificativa || 'Este evento não está disponível para novas inscrições.';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      bgcolor: '#fafafa',
      '&:hover': { bgcolor: '#f5f5f5' },
      '&.Mui-focused': { bgcolor: 'white' },
    },
    '& .MuiInputLabel-root': { fontSize: '0.95rem' },
  };

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>
      {/* ── HERO IMAGE ── */}
      {evento.imagem_url && (
        <Box sx={{ px: { xs: 2, md: 6 }, maxWidth: 1100, mx: 'auto', pt: 2, mb: 4 }}>
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 16px 64px rgba(0,0,0,0.12)',
              aspectRatio: '16/7',
              backgroundImage: `url(${evento.imagem_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </Box>
      )}

      {/* ── HERO TEXT ── */}
      <Box
        sx={{
          pt: evento.imagem_url ? 0 : { xs: 4 },
          pb: 0,
          px: 3,
          textAlign: 'center',
          maxWidth: 820,
          mx: 'auto',
        }}
      >
        {/* Badge */}
        <Box
          sx={{
            display: 'inline-block',
            border: `1.5px solid ${BRAND}`,
            borderRadius: 99,
            px: 2.5,
            py: 0.5,
            mb: 4,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: BRAND,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {isRegistrationOpen ? 'Inscrições abertas' : (statusEvento?.nome ?? 'Evento')}
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#0f0f1a',
            mb: 2,
          }}
        >
          {evento.nome}
        </Typography>

        {/* Description */}
        {evento.descricao && (
          <Box
            dangerouslySetInnerHTML={{ __html: evento.descricao }}
            sx={{
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              color: 'text.secondary',
              lineHeight: 1.7,
              maxWidth: 620,
              mb: 4,
              mx: 'auto',
              whiteSpace: 'pre-line',
              // textAlign: 'left',
              '& p': { margin: '0.5em 0' },
              '& strong, & b': { color: '#1a1a2e' },
              '& a': { color: BRAND },
            }}
          />
        )}

        {/* Date line */}
        {dataInicio && (
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
              mb: 4, gap: 1 }}>
            <Icon icon="lucide:calendar" /> 
          <Typography variant="body1">
            {dataInicio}
          </Typography>
          </Stack>
        )}

        {/* Countdown */}
        {evento.data_inicio && (
          <Box sx={{ mb: 4 }}>
            <Countdown targetDate={evento.data_inicio} />
          </Box>
        )}

        {/* CTA */}
        {isRegistrationOpen && (
          <Button
            onClick={scrollToForm}
            variant="contained"
            size="large"
            sx={{
              bgcolor: BRAND,
              color: 'white',
              borderRadius: 99,
              px: { xs: 4, md: 6 },
              py: { xs: 1.5, md: 2 },
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: `0 6px 24px ${BRAND}55`,
              '&:hover': {
                bgcolor: '#3e2c6b',
                boxShadow: `0 8px 32px ${BRAND}77`,
              },
            }}
          >
            Inscrever-se Agora — Garantir Vaga
          </Button>
        )}
      </Box>

      {/* ── FAQ SECTION ── */}
      {evento.faq && evento.faq.length > 0 && (
        <Stack sx={{my: 6, gap: 4, width: '100%'}}>
          
          <FaqSection faq={evento.faq} />
        </Stack>
      )}

      {/* ── FORM SECTION ── */}
      <Box ref={formRef} id="formulario" sx={{ maxWidth: 680, mx: 'auto', px: { xs: 2, md: 3 }, pb: 12 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.5rem', md: '2rem' },
            fontWeight: 800,
            color: '#0f0f1a',
            mb: 1,
          }}
        >
          Faça sua inscrição
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: '0.95rem' }}>
          Preencha os dados abaixo para garantir sua participação
        </Typography>

        {!isRegistrationOpen && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              O evento está {statusEvento?.nome ?? 'indisponível'}
            </Typography>
            <Typography variant="body2">{statusMensagem}</Typography>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Products */}
          {hasProdutos && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'text.primary',
                }}
              >
                Selecione uma opção {selecaoUnicaProduto ? '*' : '(opcional)'}
              </Typography>
              <Controller
                name="produtoId"
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {evento.produtos.filter((p) => !p.oculto).map((produto) => (
                      <ProductAccordion
                        key={produto.id}
                        produto={produto}
                        selected={field.value === produto.id}
                        onSelect={field.onChange}
                        disabled={!isRegistrationOpen}
                      />
                    ))}
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

          {/* Custom fields */}
          {temCamposCustomizados && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {camposVisiveis.map((campo) => (
                <CampoRenderer key={campo.id} campo={campo} control={control} disabled={!isRegistrationOpen} />
              ))}
            </Box>
          )}

          {/* Default fields */}
          {!temCamposCustomizados && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome completo"
                      fullWidth
                      disabled={!isRegistrationOpen}
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                      variant="outlined"
                      sx={fieldSx}
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
                      disabled={!isRegistrationOpen}
                      error={!!errors.telefone}
                      helperText={errors.telefone?.message}
                      variant="outlined"
                      placeholder="(00) 00000-0000"
                      InputProps={{ inputComponent: TelefoneMaskCustom as never }}
                      sx={fieldSx}
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
                      disabled={!isRegistrationOpen}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      variant="outlined"
                      sx={fieldSx}
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
                      disabled={!isRegistrationOpen}
                      error={!!errors.rg}
                      helperText={errors.rg?.message}
                      variant="outlined"
                      placeholder="00.000.000-0"
                      InputProps={{ inputComponent: RGMaskCustom as never }}
                      sx={fieldSx}
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
                      disabled={!isRegistrationOpen}
                      error={!!errors.cpf}
                      helperText={errors.cpf?.message}
                      variant="outlined"
                      placeholder="000.000.000-00"
                      InputProps={{ inputComponent: CPFMaskCustom as never }}
                      sx={fieldSx}
                    />
                  )}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Controller
                  name="termo_assinado"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} disabled={!isRegistrationOpen} />}
                      label={
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Eu declaro estar ciente e concordar com as condições contidas neste formulário de inscrição da
                          Igreja Formosa de Cristo, bem como a responsabilidade do cumprimento com o pagamento do valor
                          escolhido
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
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!isRegistrationOpen || !isValid || isSubmitting}
            sx={{
              mt: 4,
              py: 1.75,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: BRAND,
              color: 'white',
              boxShadow: `0 4px 16px ${BRAND}44`,
              '&:hover': {
                bgcolor: '#3e2c6b',
                boxShadow: `0 6px 24px ${BRAND}66`,
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e',
                boxShadow: 'none',
              },
            }}
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar Inscrição'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} variant="filled" sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
