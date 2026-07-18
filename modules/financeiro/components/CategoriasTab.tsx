'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import {
  useAtualizarCategoriaMutation,
  useCriarCategoriaMutation,
  useListarCategoriasQuery,
  useRemoverCategoriaMutation,
} from '@/config/redux/api/financeiroApi';
import type { CategoriaFinanceira, TipoCategoria } from '@/types/financeiro.types';

export function CategoriasTab() {
  const { data: categorias = [], isLoading } = useListarCategoriasQuery();
  const [criar, { isLoading: criando, error: erroCriar }] = useCriarCategoriaMutation();
  const [atualizar, { error: erroAtualizar }] = useAtualizarCategoriaMutation();
  const [remover, { error: erroRemover }] = useRemoverCategoriaMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<CategoriaFinanceira | null>(null);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoCategoria>('DESPESA');

  const erro = erroCriar || erroAtualizar || erroRemover;

  const receitas = categorias.filter((c) => c.tipo === 'RECEITA');
  const despesas = categorias.filter((c) => c.tipo === 'DESPESA');

  const abrirNovo = (tipoInicial: TipoCategoria) => {
    setEditando(null);
    setNome('');
    setTipo(tipoInicial);
    setDialogOpen(true);
  };

  const abrirEdicao = (categoria: CategoriaFinanceira) => {
    setEditando(categoria);
    setNome(categoria.nome);
    setTipo(categoria.tipo);
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    try {
      if (editando) {
        await atualizar({ id: editando.id, nome, tipo }).unwrap();
      } else {
        await criar({ nome, tipo }).unwrap();
      }
      setDialogOpen(false);
    } catch {}
  };

  const handleRemover = async (categoria: CategoriaFinanceira) => {
    if (!confirm(`Excluir a categoria "${categoria.nome}"? Transações classificadas com ela ficarão sem categoria.`)) return;
    try {
      await remover(categoria.id).unwrap();
    } catch {}
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const grupos: { titulo: string; tipo: TipoCategoria; cor: string; bg: string; itens: CategoriaFinanceira[] }[] = [
    { titulo: 'Receitas', tipo: 'RECEITA', cor: '#15803d', bg: '#f0fdf4', itens: receitas },
    { titulo: 'Despesas', tipo: 'DESPESA', cor: '#b91c1c', bg: '#fef2f2', itens: despesas },
  ];

  return (
    <Box>
      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(erro as any)?.data?.error || 'Erro ao salvar categoria'}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {grupos.map((grupo) => (
          <Box key={grupo.tipo}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: grupo.cor }}>
                {grupo.titulo}
              </Typography>
              <Button
                size="small"
                startIcon={<Icon icon="material-symbols:add" width={16} />}
                onClick={() => abrirNovo(grupo.tipo)}
                sx={{ textTransform: 'none', fontWeight: 600, color: grupo.cor }}
              >
                Nova
              </Button>
            </Stack>
            {grupo.itens.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Nenhuma categoria de {grupo.titulo.toLowerCase()}.
              </Typography>
            ) : (
              <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
                {grupo.itens.map((categoria) => (
                  <Chip
                    key={categoria.id}
                    label={categoria.nome}
                    onClick={() => abrirEdicao(categoria)}
                    onDelete={() => handleRemover(categoria)}
                    deleteIcon={<Icon icon="material-symbols:close" width={16} />}
                    sx={{
                      bgcolor: grupo.bg,
                      color: grupo.cor,
                      fontWeight: 600,
                      '& .MuiChip-deleteIcon': { color: grupo.cor, opacity: 0.6 },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        ))}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editando ? 'Editar categoria' : 'Nova categoria'}
          <IconButton onClick={() => setDialogOpen(false)}>
            <Icon icon="material-symbols:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 1 }}>
            <ToggleButtonGroup
              value={tipo}
              exclusive
              fullWidth
              size="small"
              onChange={(_, v) => v && setTipo(v)}
              sx={{
                '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600 },
              }}
            >
              <ToggleButton value="RECEITA" sx={{ '&.Mui-selected': { bgcolor: '#f0fdf4', color: '#15803d' } }}>
                Receita
              </ToggleButton>
              <ToggleButton value="DESPESA" sx={{ '&.Mui-selected': { bgcolor: '#fef2f2', color: '#b91c1c' } }}>
                Despesa
              </ToggleButton>
            </ToggleButtonGroup>
            <TextField
              label="Nome da categoria"
              placeholder={tipo === 'RECEITA' ? 'Ex.: Dízimo, Oferta' : 'Ex.: Alimentação, Energia'}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSalvar();
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSalvar}
            disabled={!nome.trim() || criando}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {criando ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
