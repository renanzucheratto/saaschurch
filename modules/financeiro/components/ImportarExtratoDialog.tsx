'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import { useImportarExtratoMutation } from '@/config/redux/api/financeiroApi';
import type { ResultadoImportacao } from '@/types/financeiro.types';

interface Props {
  open: boolean;
  contaId: string;
  onClose: () => void;
}

function primeiroDiaDoMes(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
}

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ImportarExtratoDialog({ open, contaId, onClose }: Props) {
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes());
  const [dataFim, setDataFim] = useState(hojeISO());
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);

  const [importar, { isLoading, error }] = useImportarExtratoMutation();

  const handleImportar = async () => {
    try {
      const res = await importar({ id: contaId, dataInicio, dataFim }).unwrap();
      setResultado(res);
    } catch {}
  };

  const handleClose = () => {
    setResultado(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Importar extrato
        <IconButton onClick={handleClose}>
          <Icon icon="material-symbols:close" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {!resultado ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Busca os lançamentos no banco e classifica automaticamente pelas regras cadastradas.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {(error as any)?.data?.error || 'Erro ao importar extrato'}
              </Alert>
            )}
            <Stack direction="row" gap={2} sx={{ mt: 1 }}>
              <TextField
                label="De"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Até"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Icon
              icon={
                resultado.importadas > 0
                  ? 'material-symbols:check-circle-outline'
                  : 'material-symbols:info-outline'
              }
              width={48}
              color={resultado.importadas > 0 ? '#16a34a' : '#a16207'}
            />
            <Typography sx={{ fontWeight: 700, mt: 1 }}>
              {resultado.importadas > 0 ? 'Importação concluída' : 'Nada para importar'}
            </Typography>
            <Stack sx={{ mt: 2, textAlign: 'left', maxWidth: 300, mx: 'auto' }} gap={0.5}>
              <Typography variant="body2">
                <strong>{resultado.importadas}</strong> transações importadas
              </Typography>
              <Typography variant="body2">
                <strong>{resultado.classificadas}</strong> classificadas automaticamente
              </Typography>
              <Typography variant="body2">
                <strong>{resultado.pendentes}</strong> pendentes de classificação
              </Typography>
              {resultado.duplicadasIgnoradas > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {resultado.duplicadasIgnoradas} já importadas anteriormente (ignoradas)
                </Typography>
              )}
              {(resultado.foraDoPeriodo ?? 0) > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {resultado.foraDoPeriodo} lançamentos do extrato ficaram fora do período
                  selecionado
                </Typography>
              )}
              {(resultado.ignoradasPorSaldoInicial ?? 0) > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {resultado.ignoradasPorSaldoInicial} anteriores à data do saldo inicial da conta
                </Typography>
              )}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!resultado ? (
          <>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleImportar}
              disabled={!dataInicio || !dataFim || isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Icon icon="material-symbols:cloud-download-outline" width={18} />
                )
              }
              sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            >
              Importar
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={handleClose} sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
            Fechar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
