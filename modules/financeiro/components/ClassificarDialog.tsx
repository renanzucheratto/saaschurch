'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { formatNumberToCurrency } from '@/config/helpers/currency-mask';
import {
  useClassificarTransacaoMutation,
  useDesclassificarTransacaoMutation,
  useListarCategoriasQuery,
  useListarFornecedoresQuery,
} from '@/config/redux/api/financeiroApi';
import { useListarAreasQuery } from '@/config/redux/api/areasApi';
import { useListarProjetosQuery } from '@/config/redux/api/projetosApi';
import type { CampoRegra, OperadorRegra, TransacaoBancaria } from '@/types/financeiro.types';
import { CAMPO_LABELS, OPERADOR_LABELS, OPERADORES_NUMERO, OPERADORES_TEXTO, formatDataBR } from '../utils';

interface Props {
  transacao: TransacaoBancaria | null;
  onClose: () => void;
}

interface Opcao {
  id: string;
  label: string;
}

export function ClassificarDialog({ transacao, onClose }: Props) {
  const { data: categorias = [] } = useListarCategoriasQuery();
  const { data: fornecedores = [] } = useListarFornecedoresQuery();
  const { data: areas = [] } = useListarAreasQuery();
  const { data: projetos = [] } = useListarProjetosQuery();

  const [classificar, { isLoading, error }] = useClassificarTransacaoMutation();
  const [desclassificar, { isLoading: removendo }] = useDesclassificarTransacaoMutation();

  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [fornecedorId, setFornecedorId] = useState<string | null>(null);
  const [projetoId, setProjetoId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);

  const [criarRegra, setCriarRegra] = useState(false);
  const [regraCampo, setRegraCampo] = useState<CampoRegra>('descricao');
  const [regraOperador, setRegraOperador] = useState<OperadorRegra>('contains');
  const [regraValor, setRegraValor] = useState('');

  useEffect(() => {
    if (!transacao) return;
    setCategoriaId(transacao.categoriaId);
    setFornecedorId(transacao.fornecedorId);
    setProjetoId(transacao.projetoId);
    setAreaId(transacao.areaId);
    setCriarRegra(false);
    // Pré-preenche a regra com o texto mais específico disponível
    if (transacao.historico) {
      setRegraCampo('historico');
      setRegraValor(transacao.historico);
    } else {
      setRegraCampo('descricao');
      setRegraValor(transacao.descricaoBanco);
    }
    setRegraOperador('contains');
  }, [transacao]);

  if (!transacao) return null;

  const ehCredito = transacao.tipo === 'CREDITO';
  const categoriasFiltradas = categorias.filter(
    (c) => c.tipo === (ehCredito ? 'RECEITA' : 'DESPESA'),
  );

  const catOpcoes: Opcao[] = categoriasFiltradas.map((c) => ({ id: c.id, label: c.nome }));
  const fornOpcoes: Opcao[] = fornecedores.map((f) => ({ id: f.id, label: f.nome }));
  const projOpcoes: Opcao[] = projetos.map((p: any) => ({ id: p.id, label: p.nome }));
  const areaOpcoes: Opcao[] = areas.map((a: any) => ({ id: a.id, label: a.nome }));

  const temClassificacao = !!(categoriaId || fornecedorId || projetoId || areaId);
  const operadoresDisponiveis = regraCampo === 'valor' ? OPERADORES_NUMERO : OPERADORES_TEXTO;

  const handleSalvar = async () => {
    try {
      await classificar({
        id: transacao.id,
        categoriaId,
        fornecedorId,
        projetoId,
        areaId,
        ...(criarRegra && regraValor.trim()
          ? {
              criarRegra: {
                campo: regraCampo,
                operador: regraOperador,
                valor: regraValor.trim(),
              },
            }
          : {}),
      }).unwrap();
      onClose();
    } catch {}
  };

  const handleDesclassificar = async () => {
    try {
      await desclassificar(transacao.id).unwrap();
      onClose();
    } catch {}
  };

  const selecionar = (opcoes: Opcao[], id: string | null) =>
    opcoes.find((o) => o.id === id) ?? null;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Classificar transação
        <IconButton onClick={onClose}>
          <Icon icon="material-symbols:close" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Resumo da transação */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            bgcolor: '#f8fafc',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }} noWrap>
                {transacao.descricaoBanco}
              </Typography>
              {transacao.historico && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {transacao.historico}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {formatDataBR(transacao.dataMovimento)} · Cód. {transacao.codigoBanco}
                {transacao.documento ? ` · Doc. ${transacao.documento}` : ''}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 16,
                color: ehCredito ? '#16a34a' : '#dc2626',
                flexShrink: 0,
                ml: 2,
              }}
            >
              {ehCredito ? '+' : '-'} {formatNumberToCurrency(Number(transacao.valor))}
            </Typography>
          </Stack>
          {transacao.regraAplicadaId && (
            <Chip
              label="Classificada automaticamente por regra"
              size="small"
              sx={{ mt: 1, bgcolor: '#eef2ff', color: '#6366f1', fontWeight: 600 }}
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as any)?.data?.error || 'Erro ao classificar transação'}
          </Alert>
        )}

        <Stack gap={2}>
          <Autocomplete
            options={catOpcoes}
            value={selecionar(catOpcoes, categoriaId)}
            onChange={(_, v) => setCategoriaId(v?.id ?? null)}
            renderInput={(params) => (
              <TextField {...params} label={`Categoria (${ehCredito ? 'receita' : 'despesa'})`} />
            )}
          />
          <Autocomplete
            options={fornOpcoes}
            value={selecionar(fornOpcoes, fornecedorId)}
            onChange={(_, v) => setFornecedorId(v?.id ?? null)}
            renderInput={(params) => <TextField {...params} label="Fornecedor" />}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <Autocomplete
              fullWidth
              options={areaOpcoes}
              value={selecionar(areaOpcoes, areaId)}
              onChange={(_, v) => setAreaId(v?.id ?? null)}
              renderInput={(params) => <TextField {...params} label="Área (centro de custo)" />}
            />
            <Autocomplete
              fullWidth
              options={projOpcoes}
              value={selecionar(projOpcoes, projetoId)}
              onChange={(_, v) => setProjetoId(v?.id ?? null)}
              renderInput={(params) => <TextField {...params} label="Projeto" />}
            />
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <FormControlLabel
          control={<Switch checked={criarRegra} onChange={(e) => setCriarRegra(e.target.checked)} />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Criar regra automática
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Futuras transações semelhantes serão classificadas sozinhas
              </Typography>
            </Box>
          }
        />

        {criarRegra && (
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mt: 1.5 }}>
            <TextField
              select
              label="Quando"
              value={regraCampo}
              onChange={(e) => {
                const campo = e.target.value as CampoRegra;
                setRegraCampo(campo);
                setRegraOperador(campo === 'valor' ? 'equals' : 'contains');
              }}
              sx={{ minWidth: 140 }}
            >
              {(Object.keys(CAMPO_LABELS) as CampoRegra[]).map((c) => (
                <MenuItem key={c} value={c}>
                  {CAMPO_LABELS[c]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Condição"
              value={regraOperador}
              onChange={(e) => setRegraOperador(e.target.value as OperadorRegra)}
              sx={{ minWidth: 140 }}
            >
              {operadoresDisponiveis.map((o) => (
                <MenuItem key={o} value={o}>
                  {OPERADOR_LABELS[o]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Valor"
              value={regraValor}
              onChange={(e) => setRegraValor(e.target.value)}
              fullWidth
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Box>
          {transacao.conciliada && (
            <Button color="error" onClick={handleDesclassificar} disabled={removendo}>
              {removendo ? <CircularProgress size={18} color="inherit" /> : 'Remover classificação'}
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSalvar}
            disabled={!temClassificacao || isLoading}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
