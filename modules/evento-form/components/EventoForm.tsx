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
} from '@mui/material';
import { useObterEventoQuery } from '@/config/redux';
import { usePathname } from 'next/navigation';
import { ProductAccordion } from './ProductAccordion';
import { CampoRenderer } from './CampoRenderer';
import { Countdown } from './Countdown';
import { CPFMaskCustom, RGMaskCustom, TelefoneMaskCustom } from './MaskInputs';
import { FaqSection } from './FaqSection';
import { Icon } from '@iconify/react';
import type { TipoCampoCustomizado } from '@/types/evento.types';

const BRAND = '#513B89';
const HERO_FALLBACK = 'linear-gradient(135deg, #2a1f47 0%, #513B89 100%)';

// Tipos de campo customizado que ocupam a linha inteira no template 'padrao'.
const FULL_WIDTH_TIPOS: TipoCampoCustomizado[] = ['radio', 'checkbox', 'select', 'aceite_termo'];

export const EventoForm = () => {
  const params = usePathname();
  const eventoId = params?.split('/').pop() ?? '';
  const formRef = useRef<HTMLDivElement>(null);

  const { data: evento, isLoading: isLoadingEvento } = useObterEventoQuery(eventoId);

  // Produtos ocultos não são escolhidos pelo inscrito — a organização atribui depois,
  // ao editar o participante, para poder lançar as parcelas.
  const produtosVisiveis = (evento?.produtos ?? []).filter((p) => !p.oculto);
  const hasProdutos = produtosVisiveis.length > 0;
  const selecaoUnicaProduto = evento?.selecao_unica_produto;
  const statusEvento = evento?.statusAtual ?? evento?.status ?? null;
  const isRegistrationOpen = statusEvento?.nome === 'aberto';
  const campos = evento?.campos_customizados ?? [];
  const temCamposCustomizados = campos.length > 0;
  const camposVisiveis = campos.filter((c) => !c.oculto);
  // 'empilhado' joga tudo numa coluna; 'padrao' mantém o grid de 2 colunas.
  const templateFormulario = evento?.template_formulario ?? 'padrao';
  const empilhado = templateFormulario === 'empilhado';

  const {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    isValid,
    alert,
    handleCloseAlert,
    redirecionandoPagamento,
  } = useEventoForm(
    eventoId,
    hasProdutos,
    selecaoUnicaProduto,
    isRegistrationOpen,
    campos,
    produtosVisiveis,
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

  const dataLabel = formatDate(evento.data_inicio);
  const inicioHora = formatTime(evento.data_inicio);
  const fimHora = formatTime(evento.data_fim);
  const horarioLabel = inicioHora ? (fimHora ? `${inicioHora} às ${fimHora}` : inicioHora) : null;

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
      {/* ── HERO BAND ── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: evento.imagem_url ? undefined : HERO_FALLBACK,
          ...(evento.imagem_url && {
            backgroundImage: `url(${evento.imagem_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }),
          '&::before': evento.imagem_url
            ? {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(15,15,26,0.82) 0%, rgba(81,59,137,0.72) 100%)',
              }
            : undefined,
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', py: 7 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 4, md: 6 },
            }}
          >
            {/* Título + badge */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'inline-block',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  borderRadius: 99,
                  px: 2.5,
                  py: 0.5,
                  mb: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {isRegistrationOpen ? 'Inscrições abertas' : statusEvento?.nome ?? 'Evento'}
                </Typography>
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                {evento.nome}
              </Typography>
            </Box>

            {/* Countdown */}
            {evento.data_inicio && (
              <Box sx={{ flexShrink: 0 }}>
                <Countdown targetDate={evento.data_inicio} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* ── DUAS COLUNAS ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'start',
          }}
        >
          {/* ── COLUNA ESQUERDA ── */}
          <Box>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 800,
                    color: '#0f0f1a',
                    mb: 2.5,
                  }}
                >
                  Informações do evento
                </Typography>
            {/* Card detalhes do evento */}

            {(dataLabel || horarioLabel) && (
              <Box
                sx={{
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 3,
                  bgcolor: '#faf9fc',
                  p: { xs: 3, md: 3 },
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2.5, md: 4 } }}>
                  {dataLabel && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Icon icon="lucide:calendar" width={20} color={BRAND} />
                      <Typography sx={{ fontSize: '0.95rem', color: 'text.primary' }}>{dataLabel}</Typography>
                    </Box>
                  )}
                  {horarioLabel && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Icon icon="lucide:clock" width={20} color={BRAND} />
                      <Typography sx={{ fontSize: '0.95rem', color: 'text.primary' }}>{horarioLabel}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            

            {/* O que você vai aprender */}
            {evento.descricao && (
              <>
                <Box
                  dangerouslySetInnerHTML={{ __html: evento.descricao }}
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    '& p': { margin: '0.5em 0' },
                    '& strong, & b': { color: '#1a1a2e' },
                    '& a': { color: BRAND },
                  }}
                />
              </>
            )}
          </Box>

          {/* ── COLUNA DIREITA (FORMULÁRIO) ── */}
          <Box ref={formRef} id="formulario">
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: '#0f0f1a', mb: 1 }}
            >
              Inscreva-se
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
              {/* Produtos */}
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
                        {produtosVisiveis.map((produto) => (
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

              {/* Campos customizados (grid 2 colunas) */}
              {temCamposCustomizados && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: empilhado ? '1fr' : { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2.5,
                  }}
                >
                  {camposVisiveis.map((campo) => (
                    <Box
                      key={campo.id}
                      sx={{
                        gridColumn:
                          empilhado || FULL_WIDTH_TIPOS.includes(campo.tipo) ? '1 / -1' : 'auto',
                      }}
                    >
                      <CampoRenderer campo={campo} control={control} disabled={!isRegistrationOpen} />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Campos padrão (grid 2 colunas) */}
              {!temCamposCustomizados && (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2.5,
                    }}
                  >
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
                          sx={{ ...fieldSx, gridColumn: { sm: '1 / -1' } }}
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
                              Eu declaro estar ciente e concordar com as condições contidas neste formulário de
                              inscrição da Igreja Formosa de Cristo, bem como a responsabilidade do cumprimento com o
                              pagamento do valor escolhido
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
                {redirecionandoPagamento
                  ? 'Redirecionando para o pagamento...'
                  : isSubmitting
                    ? 'Enviando...'
                    : 'Confirmar Inscrição'}
              </Button>

              {/* A navegação para a tela de pagamento é praticamente instantânea
                  (rota interna), mas o aviso evita clique duplo mesmo assim. */}
              {redirecionandoPagamento && (
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}
                >
                  Inscrição registrada. Levando você para a tela de pagamento —
                  não feche esta página.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* ── FAQ (full-width) ── */}
        {evento.faq && evento.faq.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <FaqSection faq={evento.faq} />
          </Box>
        )}
      </Container>

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
