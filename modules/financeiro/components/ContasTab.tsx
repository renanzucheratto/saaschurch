'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import {
  CurrencyMaskCustom,
  formatCurrencyToNumber,
  formatNumberToCurrency,
} from '@/config/helpers/currency-mask';
import { BORDER_RADIUS } from '@/config/utils/contants';
import {
  useAtualizarContaMutation,
  useCriarContaMutation,
  useRemoverContaMutation,
} from '@/config/redux/api/financeiroApi';
import type { ContaBancaria } from '@/types/financeiro.types';
import { formatDataBR } from '../utils';

interface Props {
  contas: ContaBancaria[];
  isLoading: boolean;
}

interface FormState {
  banco: string;
  agencia: string;
  conta: string;
  digito: string;
  descricao: string;
  saldoInicial: string | number;
  dataSaldoInicial: string;
}

const FORM_VAZIO: FormState = {
  banco: '237',
  agencia: '',
  conta: '',
  digito: '',
  descricao: '',
  saldoInicial: '',
  dataSaldoInicial: '',
};

export function ContasTab({ contas, isLoading }: Props) {
  const [criar, { isLoading: criando, error: erroCriar }] = useCriarContaMutation();
  const [atualizar, { isLoading: atualizando, error: erroAtualizar }] = useAtualizarContaMutation();
  const [remover, { error: erroRemover }] = useRemoverContaMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ContaBancaria | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);

  const erro = erroCriar || erroAtualizar || erroRemover;
  const salvando = criando || atualizando;

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    setDialogOpen(true);
  };

  const abrirEdicao = (conta: ContaBancaria) => {
    setEditando(conta);
    setForm({
      banco: conta.banco,
      agencia: conta.agencia,
      conta: conta.conta,
      digito: conta.digito ?? '',
      descricao: conta.descricao ?? '',
      saldoInicial: Number(conta.saldoInicial),
      dataSaldoInicial: conta.dataSaldoInicial ? conta.dataSaldoInicial.slice(0, 10) : '',
    });
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    const payload = {
      banco: form.banco,
      agencia: form.agencia,
      conta: form.conta,
      digito: form.digito || null,
      descricao: form.descricao || null,
      saldoInicial: formatCurrencyToNumber(form.saldoInicial),
      dataSaldoInicial: form.dataSaldoInicial || null,
    };
    try {
      if (editando) {
        await atualizar({ id: editando.id, ...payload } as never).unwrap();
      } else {
        await criar(payload as never).unwrap();
      }
      setDialogOpen(false);
    } catch {}
  };

  const handleRemover = async (conta: ContaBancaria) => {
    if (!confirm(`Excluir a conta ${conta.descricao || conta.conta}?`)) return;
    try {
      await remover(conta.id).unwrap();
    } catch {}
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(erro as any)?.data?.error || 'Erro ao salvar conta'}
        </Alert>
      )}

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={abrirNovo}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none', fontWeight: 600 }}
        >
          Nova conta
        </Button>
      </Stack>

      {contas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Icon icon="material-symbols:account-balance-outline" width={48} style={{ opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Nenhuma conta cadastrada. O saldo inicial é o ponto de partida da conciliação.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {contas.map((conta) => (
            <Card key={conta.id} variant="outlined" sx={{ borderRadius: BORDER_RADIUS.medium, p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" gap={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      bgcolor: '#eef2ff',
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon="material-symbols:account-balance-outline" width={20} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
                      {conta.descricao || `Banco ${conta.banco}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ag {conta.agencia} · Cc {conta.conta}
                      {conta.digito ? `-${conta.digito}` : ''}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row">
                  <IconButton size="small" onClick={() => abrirEdicao(conta)}>
                    <Icon icon="material-symbols:edit-outline" width={18} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleRemover(conta)}>
                    <Icon icon="material-symbols:delete-outline" width={18} />
                  </IconButton>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Saldo inicial
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                    {formatNumberToCurrency(Number(conta.saldoInicial))}
                  </Typography>
                  {conta.dataSaldoInicial && (
                    <Typography variant="caption" color="text.secondary">
                      desde {formatDataBR(conta.dataSaldoInicial)}
                    </Typography>
                  )}
                </Box>
                {!conta.ativo && <Chip label="Inativa" size="small" color="default" />}
              </Stack>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editando ? 'Editar conta' : 'Nova conta bancária'}
          <IconButton onClick={() => setDialogOpen(false)}>
            <Icon icon="material-symbols:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Apelido da conta"
              placeholder="Ex.: Conta principal Bradesco"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              fullWidth
            />
            <Stack direction="row" gap={2}>
              <TextField
                label="Banco (código)"
                value={form.banco}
                onChange={(e) => setForm({ ...form, banco: e.target.value })}
                sx={{ width: 140 }}
              />
              <TextField
                label="Agência"
                value={form.agencia}
                onChange={(e) => setForm({ ...form, agencia: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction="row" gap={2}>
              <TextField
                label="Conta"
                value={form.conta}
                onChange={(e) => setForm({ ...form, conta: e.target.value })}
                fullWidth
              />
              <TextField
                label="Dígito"
                value={form.digito}
                onChange={(e) => setForm({ ...form, digito: e.target.value })}
                sx={{ width: 110 }}
              />
            </Stack>
            <Stack direction="row" gap={2}>
              <TextField
                label="Saldo inicial"
                placeholder="R$ 0,00"
                value={form.saldoInicial}
                onChange={(e) => setForm({ ...form, saldoInicial: e.target.value })}
                InputProps={{ inputComponent: CurrencyMaskCustom as any }}
                fullWidth
              />
              <TextField
                label="Saldo inicial em"
                type="date"
                value={form.dataSaldoInicial}
                onChange={(e) => setForm({ ...form, dataSaldoInicial: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              O saldo inicial é o ponto de partida da conciliação. Lançamentos anteriores à data
              informada não serão importados.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSalvar}
            disabled={!form.banco.trim() || !form.agencia.trim() || !form.conta.trim() || salvando}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {salvando ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
