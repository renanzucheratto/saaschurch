'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import {
  useConectarMercadoPagoMutation,
  useDesvincularMercadoPagoMutation,
  useStatusMercadoPagoQuery,
} from '@/config/redux/api/mercadopagoApi';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { BORDER_RADIUS } from '@/config/utils/contants';
import { StatusConexaoChip } from './StatusConexaoChip';
import { DesvincularDialog } from './DesvincularDialog';

const MENSAGENS_ERRO: Record<string, string> = {
  autorizacao_recusada: 'Você cancelou a autorização no Mercado Pago.',
  state_invalido: 'A solicitação expirou. Clique em Conectar novamente.',
  parametros_ausentes: 'Retorno inválido do Mercado Pago. Tente novamente.',
  falha_troca_token:
    'Não foi possível concluir a conexão. Tente novamente ou contate o suporte.',
};

function formatarData(valor?: string | null): string {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function ConexaoMercadoPago() {
  const { is } = usePermissions();
  const podeGerenciar = is('backoffice');

  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: conta, isLoading, refetch } = useStatusMercadoPagoQuery();
  const [conectar, { isLoading: conectando }] = useConectarMercadoPagoMutation();
  const [desvincular, { isLoading: desvinculando }] = useDesvincularMercadoPagoMutation();

  const [dialogAberto, setDialogAberto] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Retorno do callback OAuth. O ?status=ok diz apenas que o callback não
  // estourou — a verdade está no banco, então refetch antes de declarar sucesso.
  useEffect(() => {
    const status = searchParams.get('status');
    if (!status) return;

    refetch();

    setAviso(
      status === 'ok'
        ? { tipo: 'success', texto: 'Conta Mercado Pago conectada.' }
        : {
            tipo: 'error',
            texto:
              MENSAGENS_ERRO[searchParams.get('motivo') ?? ''] ??
              'Não foi possível conectar a conta.',
          },
    );

    // Sem isso, um F5 reexibe o aviso indefinidamente.
    router.replace('/configuracoes/pagamentos');
  }, [searchParams, refetch, router]);

  const handleConectar = async () => {
    try {
      const { authorizationUrl } = await conectar().unwrap();
      // Navegação completa, não popup: o fluxo termina num redirect do MP de
      // volta para esta mesma rota.
      window.location.href = authorizationUrl;
    } catch (err: any) {
      setAviso({
        tipo: 'error',
        texto: err?.data?.error ?? 'Não foi possível iniciar a conexão.',
      });
    }
  };

  const handleDesvincular = async () => {
    try {
      const resultado = await desvincular().unwrap();
      setAviso({ tipo: 'success', texto: resultado.message });
    } catch (err: any) {
      setAviso({
        tipo: 'error',
        texto: err?.data?.error ?? 'Não foi possível desvincular a conta.',
      });
    } finally {
      setDialogAberto(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const status = conta?.status;
  const conectado = conta?.conectado === true;
  const expirado = status === 'EXPIRED';

  const textoBotaoPrincipal =
    status === 'EXPIRED'
      ? 'Reconectar'
      : status === 'REVOKED'
        ? 'Conectar novamente'
        : status === 'PENDING'
          ? 'Concluir conexão'
          : 'Conectar Mercado Pago';

  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Pagamentos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conecte a conta Mercado Pago da sua instituição para receber inscrições pagas online. O
          dinheiro cai direto na conta da instituição.
        </Typography>
      </Stack>

      {!podeGerenciar && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Apenas usuários backoffice podem conectar ou desvincular a conta.
        </Alert>
      )}

      {/* EXPIRED significa que o refresh falhou e o checkout está fora do ar
          para esta instituição. Merece alerta, não só um chip discreto. */}
      {expirado && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          O acesso à conta Mercado Pago expirou e <strong>novas cobranças não estão sendo
          processadas</strong>. Reconecte para voltar a receber pagamentos online.
          {conta?.ultimoErro && (
            <Typography variant="caption" component="div" sx={{ mt: 1 }}>
              Detalhe: {conta.ultimoErro}
            </Typography>
          )}
        </Alert>
      )}

      <Card variant="outlined" sx={{ borderRadius: BORDER_RADIUS }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Icon icon="simple-icons:mercadopago" width={28} />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Mercado Pago
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Conta da instituição
                </Typography>
              </Box>
            </Stack>
            <StatusConexaoChip status={status} conectado={conectado} />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {conectado ? (
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150 }}>
                  ID no Mercado Pago
                </Typography>
                <Typography variant="body2">{conta?.mpUserId ?? '—'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150 }}>
                  Conectada em
                </Typography>
                <Typography variant="body2">{formatarData(conta?.conectadoEm)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 150 }}>
                  Última renovação
                </Typography>
                <Typography variant="body2">{formatarData(conta?.ultimoRefreshEm)}</Typography>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ao conectar, você será levado ao Mercado Pago para autorizar o acesso. É preciso
                fazer login na conta <strong>da instituição</strong>, não em uma conta pessoal.
              </Typography>
              <Stack spacing={0.5}>
                {[
                  'O valor da inscrição cai direto na conta da instituição',
                  'A taxa da plataforma é descontada automaticamente',
                  'Nunca temos acesso à senha da conta',
                  'Você pode desvincular quando quiser',
                ].map((texto) => (
                  <Stack key={texto} direction="row" spacing={1} alignItems="center">
                    <Icon icon="material-symbols:check-small" width={18} />
                    <Typography variant="body2">{texto}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}

          <Stack direction="row" spacing={1}>
            {conectado ? (
              <Button
                variant="outlined"
                color="error"
                disabled={!podeGerenciar || desvinculando}
                onClick={() => setDialogAberto(true)}
              >
                Desvincular
              </Button>
            ) : (
              <Button
                variant="contained"
                disabled={!podeGerenciar || conectando}
                onClick={handleConectar}
                startIcon={
                  conectando ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Icon icon="material-symbols:link" width={18} />
                  )
                }
              >
                {conectando ? 'Redirecionando...' : textoBotaoPrincipal}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <DesvincularDialog
        aberto={dialogAberto}
        processando={desvinculando}
        onFechar={() => setDialogAberto(false)}
        onConfirmar={handleDesvincular}
      />

      <Snackbar
        open={!!aviso}
        autoHideDuration={6000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={aviso?.tipo ?? 'info'} onClose={() => setAviso(null)}>
          {aviso?.texto}
        </Alert>
      </Snackbar>
    </Box>
  );
}
