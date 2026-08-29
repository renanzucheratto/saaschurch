'use client';

import { useState } from 'react';
import Script from 'next/script';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import {
  useAssinarMutation,
  useCancelarAssinaturaMutation,
  useLazyChavePublicaAssinaturaQuery,
  useStatusAssinaturaQuery,
} from '@/config/redux/api/assinaturaApi';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { BORDER_RADIUS } from '@/config/utils/contants';

function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(valor?: string | null): string {
  if (!valor) return '—';
  return new Date(valor).toLocaleDateString('pt-BR');
}

const CONFIG_STATUS: Record<string, { label: string; color: 'success' | 'warning' | 'default' | 'error' }> = {
  ACTIVE: { label: 'Em dia', color: 'success' },
  PENDING: { label: 'Aguardando confirmação', color: 'warning' },
  SUSPENDED: { label: 'Suspensa', color: 'error' },
  CANCELLED: { label: 'Cancelada', color: 'default' },
};

export function AssinaturaMensalidade() {
  const { is } = usePermissions();
  const podeGerenciar = is('backoffice');

  const { data: status, isLoading, refetch } = useStatusAssinaturaQuery();
  const [buscarChavePublica] = useLazyChavePublicaAssinaturaQuery();
  const [assinar, { isLoading: assinando }] = useAssinarMutation();
  const [cancelar, { isLoading: cancelando }] = useCancelarAssinaturaMutation();

  const [scriptPronto, setScriptPronto] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [cartao, setCartao] = useState({ numero: '', nome: '', mes: '', ano: '', cvv: '' });

  const handleAssinar = async () => {
    if (!window.PagSeguro || !scriptPronto) {
      setAviso({ tipo: 'error', texto: 'Ainda carregando o módulo de pagamento. Tente novamente.' });
      return;
    }

    try {
      const { publicKey } = await buscarChavePublica().unwrap();

      const resultado = window.PagSeguro.encryptCard({
        publicKey,
        holder: cartao.nome,
        number: cartao.numero.replace(/\D/g, ''),
        expMonth: cartao.mes,
        expYear: cartao.ano,
        securityCode: cartao.cvv,
      });

      if (resultado.hasErrors || !resultado.encryptedCard) {
        setAviso({ tipo: 'error', texto: resultado.errors?.[0]?.message || 'Dados do cartão inválidos.' });
        return;
      }

      await assinar({ cartaoCifrado: resultado.encryptedCard, securityCode: cartao.cvv }).unwrap();
      setAviso({ tipo: 'success', texto: 'Assinatura confirmada.' });
      setCartao({ numero: '', nome: '', mes: '', ano: '', cvv: '' });
      refetch();
    } catch (error) {
      const detalhe = (error as { data?: { error?: string } })?.data?.error ?? 'Não foi possível processar o cartão.';
      setAviso({ tipo: 'error', texto: detalhe });
    }
  };

  const handleCancelar = async () => {
    try {
      await cancelar().unwrap();
      setAviso({ tipo: 'success', texto: 'Assinatura cancelada.' });
    } catch (error) {
      const detalhe = (error as { data?: { error?: string } })?.data?.error ?? 'Não foi possível cancelar.';
      setAviso({ tipo: 'error', texto: detalhe });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const cfg = status?.status ? CONFIG_STATUS[status.status] : undefined;

  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Mensalidade
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cobrança recorrente da sua instituição com a plataforma, via PagBank.
        </Typography>
      </Stack>

      {!podeGerenciar && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Apenas usuários backoffice podem gerenciar a mensalidade.
        </Alert>
      )}

      <Card variant="outlined" sx={{ borderRadius: BORDER_RADIUS }}>
        <CardContent>
          {status?.assinada || status?.status ? (
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>
                  {status.plano?.nome ?? 'Plano'}
                </Typography>
                {cfg && <Chip size="small" color={cfg.color} label={cfg.label} />}
              </Stack>
              <Divider />
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
                  Valor mensal
                </Typography>
                <Typography variant="body2">{status.valor ? moeda(status.valor) : '—'}</Typography>
              </Stack>
              {status.cardUltimosDigitos && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
                    Cartão
                  </Typography>
                  <Typography variant="body2">
                    {status.cardBrand ?? 'cartão'} final {status.cardUltimosDigitos}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
                  Próxima cobrança
                </Typography>
                <Typography variant="body2">{formatarData(status.proximaCobranca)}</Typography>
              </Stack>

              {status.status === 'ACTIVE' && (
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ mt: 1, alignSelf: 'flex-start' }}
                  disabled={!podeGerenciar || cancelando}
                  onClick={handleCancelar}
                >
                  {cancelando ? 'Cancelando...' : 'Cancelar mensalidade'}
                </Button>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Nenhuma assinatura ativa.
            </Typography>
          )}

          {podeGerenciar && (!status?.assinada || status?.status === 'CANCELLED') && (
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              <Script
                src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                  // O SDK inicia em PROD; sem isto a tela de mensalidade
                  // operaria em ambiente diferente do checkout.
                  window.PagSeguro?.setUp({
                    env:
                      process.env.NEXT_PUBLIC_PAGBANK_ENV === 'production'
                        ? 'PROD'
                        : 'SANDBOX',
                  });
                  setScriptPronto(true);
                }}
              />

              <Typography variant="subtitle2" fontWeight={600}>
                Cadastrar cartão para a mensalidade
              </Typography>

              <TextField
                label="Nome impresso no cartão"
                size="small"
                value={cartao.nome}
                onChange={(e) => setCartao((c) => ({ ...c, nome: e.target.value }))}
              />
              <TextField
                label="Número do cartão"
                size="small"
                inputMode="numeric"
                value={cartao.numero}
                onChange={(e) => setCartao((c) => ({ ...c, numero: e.target.value }))}
              />
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Mês"
                  size="small"
                  placeholder="MM"
                  value={cartao.mes}
                  onChange={(e) => setCartao((c) => ({ ...c, mes: e.target.value }))}
                  sx={{ width: 90 }}
                />
                <TextField
                  label="Ano"
                  size="small"
                  placeholder="AAAA"
                  value={cartao.ano}
                  onChange={(e) => setCartao((c) => ({ ...c, ano: e.target.value }))}
                  sx={{ width: 110 }}
                />
                <TextField
                  label="CVV"
                  size="small"
                  value={cartao.cvv}
                  onChange={(e) => setCartao((c) => ({ ...c, cvv: e.target.value }))}
                  sx={{ width: 90 }}
                />
              </Stack>

              <Button
                variant="contained"
                disabled={assinando || !scriptPronto}
                onClick={handleAssinar}
                startIcon={
                  assinando ? <CircularProgress size={16} color="inherit" /> : <Icon icon="material-symbols:credit-card-outline" width={18} />
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                {assinando ? 'Processando...' : 'Assinar'}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

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
