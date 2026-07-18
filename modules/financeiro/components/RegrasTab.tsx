'use client';

import { useState } from 'react';
import {
  Alert,
  Autocomplete,
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
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { BORDER_RADIUS } from '@/config/utils/contants';
import {
  useAplicarRegraMutation,
  useAtualizarRegraMutation,
  useCriarRegraMutation,
  useListarCategoriasQuery,
  useListarFornecedoresQuery,
  useListarRegrasQuery,
  useRemoverRegraMutation,
} from '@/config/redux/api/financeiroApi';
import { useListarAreasQuery } from '@/config/redux/api/areasApi';
import { useListarProjetosQuery } from '@/config/redux/api/projetosApi';
import type { CampoRegra, OperadorRegra, RegraConciliacao } from '@/types/financeiro.types';
import {
  CAMPO_LABELS,
  OPERADOR_LABELS,
  OPERADORES_NUMERO,
  OPERADORES_TEXTO,
  descreverRegra,
} from '../utils';

interface Opcao {
  id: string;
  label: string;
}

interface FormState {
  nome: string;
  campo: CampoRegra;
  operador: OperadorRegra;
  valor: string;
  tipoTransacao: '' | 'CREDITO' | 'DEBITO';
  categoriaId: string | null;
  fornecedorId: string | null;
  projetoId: string | null;
  areaId: string | null;
  prioridade: number;
}

const FORM_VAZIO: FormState = {
  nome: '',
  campo: 'descricao',
  operador: 'contains',
  valor: '',
  tipoTransacao: '',
  categoriaId: null,
  fornecedorId: null,
  projetoId: null,
  areaId: null,
  prioridade: 0,
};

export function RegrasTab() {
  const { data: regras = [], isLoading } = useListarRegrasQuery();
  const { data: categorias = [] } = useListarCategoriasQuery();
  const { data: fornecedores = [] } = useListarFornecedoresQuery();
  const { data: areas = [] } = useListarAreasQuery();
  const { data: projetos = [] } = useListarProjetosQuery();

  const [criar, { isLoading: criando, error: erroCriar }] = useCriarRegraMutation();
  const [atualizar, { isLoading: atualizando, error: erroAtualizar }] = useAtualizarRegraMutation();
  const [remover, { error: erroRemover }] = useRemoverRegraMutation();
  const [aplicar, { isLoading: aplicando }] = useAplicarRegraMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<RegraConciliacao | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [feedback, setFeedback] = useState<string | null>(null);

  const erro = erroCriar || erroAtualizar || erroRemover;
  const salvando = criando || atualizando;

  const catOpcoes: Opcao[] = categorias.map((c) => ({ id: c.id, label: `${c.nome} (${c.tipo === 'RECEITA' ? 'Receita' : 'Despesa'})` }));
  const fornOpcoes: Opcao[] = fornecedores.map((f) => ({ id: f.id, label: f.nome }));
  const projOpcoes: Opcao[] = projetos.map((p: any) => ({ id: p.id, label: p.nome }));
  const areaOpcoes: Opcao[] = areas.map((a: any) => ({ id: a.id, label: a.nome }));

  const selecionar = (opcoes: Opcao[], id: string | null) =>
    opcoes.find((o) => o.id === id) ?? null;

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    setDialogOpen(true);
  };

  const abrirEdicao = (regra: RegraConciliacao) => {
    setEditando(regra);
    setForm({
      nome: regra.nome ?? '',
      campo: regra.campo,
      operador: regra.operador,
      valor: regra.valor,
      tipoTransacao: regra.tipoTransacao ?? '',
      categoriaId: regra.categoriaId,
      fornecedorId: regra.fornecedorId,
      projetoId: regra.projetoId,
      areaId: regra.areaId,
      prioridade: regra.prioridade,
    });
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    const payload = {
      nome: form.nome || null,
      campo: form.campo,
      operador: form.operador,
      valor: form.valor,
      tipoTransacao: form.tipoTransacao || null,
      categoriaId: form.categoriaId,
      fornecedorId: form.fornecedorId,
      projetoId: form.projetoId,
      areaId: form.areaId,
      prioridade: form.prioridade,
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

  const handleRemover = async (regra: RegraConciliacao) => {
    if (!confirm(`Excluir a regra "${regra.nome || descreverRegra(regra)}"?`)) return;
    try {
      await remover(regra.id).unwrap();
    } catch {}
  };

  const handleAplicar = async (regra: RegraConciliacao) => {
    try {
      const res = await aplicar({ id: regra.id }).unwrap();
      setFeedback(
        res.classificadas > 0
          ? `${res.classificadas} transação(ões) classificada(s) por esta regra.`
          : 'Nenhuma transação pendente casou com esta regra.',
      );
    } catch {}
  };

  const toggleAtivo = async (regra: RegraConciliacao) => {
    try {
      await atualizar({ id: regra.id, ativo: !regra.ativo } as never).unwrap();
    } catch {}
  };

  const temClassificacao = !!(form.categoriaId || form.fornecedorId || form.projetoId || form.areaId);
  const operadoresDisponiveis = form.campo === 'valor' ? OPERADORES_NUMERO : OPERADORES_TEXTO;

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
          {(erro as any)?.data?.error || 'Erro ao salvar regra'}
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Regras classificam transações automaticamente na importação. A de menor prioridade vence.
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={abrirNovo}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
        >
          Nova regra
        </Button>
      </Stack>

      {regras.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Icon icon="material-symbols:bolt-outline" width={48} style={{ opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1, maxWidth: 460, mx: 'auto' }}>
            Nenhuma regra ainda. Exemplo: quando o histórico contém &quot;ASSAI&quot;, classificar como
            Alimentação + fornecedor Assaí. Você também pode criar regras ao classificar uma
            transação manualmente.
          </Typography>
        </Box>
      ) : (
        <Stack gap={1.5}>
          {regras.map((regra) => {
            const chips = [
              regra.categoria && { label: regra.categoria.nome, bg: '#eef2ff', cor: '#4f46e5' },
              regra.fornecedor && { label: regra.fornecedor.nome, bg: '#f0fdf4', cor: '#15803d' },
              regra.area && { label: regra.area.nome, bg: '#fff7ed', cor: '#c2410c' },
              regra.projeto && { label: regra.projeto.nome, bg: '#f0f9ff', cor: '#0369a1' },
            ].filter(Boolean) as { label: string; bg: string; cor: string }[];

            return (
              <Card
                key={regra.id}
                variant="outlined"
                sx={{
                  borderRadius: BORDER_RADIUS.medium,
                  p: 2,
                  opacity: regra.ativo ? 1 : 0.55,
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={1.5}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
                        {regra.nome || descreverRegra(regra)}
                      </Typography>
                      {regra.tipoTransacao && (
                        <Chip
                          label={regra.tipoTransacao === 'CREDITO' ? 'Entradas' : 'Saídas'}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: regra.tipoTransacao === 'CREDITO' ? '#f0fdf4' : '#fef2f2',
                            color: regra.tipoTransacao === 'CREDITO' ? '#15803d' : '#b91c1c',
                          }}
                        />
                      )}
                      <Chip
                        label={`Prioridade ${regra.prioridade}`}
                        size="small"
                        sx={{ height: 20, fontSize: 11, bgcolor: 'action.hover', color: 'text.secondary' }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.3 }}>
                      Quando {descreverRegra(regra)}
                    </Typography>
                    <Stack direction="row" gap={0.5} sx={{ flexWrap: 'wrap', mt: 0.8 }}>
                      <Icon icon="material-symbols:arrow-forward" width={14} color="#999" />
                      {chips.map((c) => (
                        <Chip
                          key={c.label}
                          label={c.label}
                          size="small"
                          sx={{ height: 20, fontSize: 11, bgcolor: c.bg, color: c.cor, fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
                    <Tooltip title="Aplicar agora nas transações pendentes">
                      <span>
                        <IconButton size="small" onClick={() => handleAplicar(regra)} disabled={aplicando || !regra.ativo}>
                          <Icon icon="material-symbols:bolt-outline" width={19} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <IconButton size="small" onClick={() => abrirEdicao(regra)}>
                      <Icon icon="material-symbols:edit-outline" width={18} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRemover(regra)}>
                      <Icon icon="material-symbols:delete-outline" width={18} />
                    </IconButton>
                    <Tooltip title={regra.ativo ? 'Desativar' : 'Ativar'}>
                      <Switch size="small" checked={regra.ativo} onChange={() => toggleAtivo(regra)} />
                    </Tooltip>
                  </Stack>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editando ? 'Editar regra' : 'Nova regra'}
          <IconButton onClick={() => setDialogOpen(false)}>
            <Icon icon="material-symbols:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome da regra (opcional)"
              placeholder="Ex.: Compras no Assaí"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              fullWidth
            />

            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
              Quando…
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <TextField
                select
                label="Campo"
                value={form.campo}
                onChange={(e) => {
                  const campo = e.target.value as CampoRegra;
                  setForm({
                    ...form,
                    campo,
                    operador: campo === 'valor' ? 'equals' : 'contains',
                  });
                }}
                sx={{ minWidth: 150 }}
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
                value={form.operador}
                onChange={(e) => setForm({ ...form, operador: e.target.value as OperadorRegra })}
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
                placeholder={form.campo === 'valor' ? 'Ex.: 1000' : 'Ex.: ASSAI'}
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                fullWidth
              />
            </Stack>
            <TextField
              select
              label="Aplicar a"
              value={form.tipoTransacao}
              onChange={(e) => setForm({ ...form, tipoTransacao: e.target.value as FormState['tipoTransacao'] })}
              sx={{ maxWidth: 240 }}
            >
              <MenuItem value="">Entradas e saídas</MenuItem>
              <MenuItem value="CREDITO">Somente entradas</MenuItem>
              <MenuItem value="DEBITO">Somente saídas</MenuItem>
            </TextField>

            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
              Classificar como…
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Autocomplete
                fullWidth
                options={catOpcoes}
                value={selecionar(catOpcoes, form.categoriaId)}
                onChange={(_, v) => setForm({ ...form, categoriaId: v?.id ?? null })}
                renderInput={(params) => <TextField {...params} label="Categoria" />}
              />
              <Autocomplete
                fullWidth
                options={fornOpcoes}
                value={selecionar(fornOpcoes, form.fornecedorId)}
                onChange={(_, v) => setForm({ ...form, fornecedorId: v?.id ?? null })}
                renderInput={(params) => <TextField {...params} label="Fornecedor" />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Autocomplete
                fullWidth
                options={areaOpcoes}
                value={selecionar(areaOpcoes, form.areaId)}
                onChange={(_, v) => setForm({ ...form, areaId: v?.id ?? null })}
                renderInput={(params) => <TextField {...params} label="Área (centro de custo)" />}
              />
              <Autocomplete
                fullWidth
                options={projOpcoes}
                value={selecionar(projOpcoes, form.projetoId)}
                onChange={(_, v) => setForm({ ...form, projetoId: v?.id ?? null })}
                renderInput={(params) => <TextField {...params} label="Projeto" />}
              />
            </Stack>
            <TextField
              label="Prioridade"
              type="number"
              helperText="Menor número é avaliado primeiro"
              value={form.prioridade}
              onChange={(e) => setForm({ ...form, prioridade: parseInt(e.target.value, 10) || 0 })}
              sx={{ maxWidth: 200 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSalvar}
            disabled={!form.valor.trim() || !temClassificacao || salvando}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {salvando ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!feedback}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        message={feedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
