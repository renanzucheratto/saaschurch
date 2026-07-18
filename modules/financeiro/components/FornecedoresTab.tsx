'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Icon } from '@iconify/react';
import {
  useAtualizarFornecedorMutation,
  useCriarFornecedorMutation,
  useListarFornecedoresQuery,
  useRemoverFornecedorMutation,
} from '@/config/redux/api/financeiroApi';
import type { Fornecedor } from '@/types/financeiro.types';

interface FormState {
  nome: string;
  cnpjCpf: string;
  telefone: string;
  email: string;
  observacao: string;
}

const FORM_VAZIO: FormState = { nome: '', cnpjCpf: '', telefone: '', email: '', observacao: '' };

export function FornecedoresTab() {
  const { data: fornecedores = [], isLoading } = useListarFornecedoresQuery();
  const [criar, { isLoading: criando, error: erroCriar }] = useCriarFornecedorMutation();
  const [atualizar, { isLoading: atualizando, error: erroAtualizar }] = useAtualizarFornecedorMutation();
  const [remover, { error: erroRemover }] = useRemoverFornecedorMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);

  const erro = erroCriar || erroAtualizar || erroRemover;
  const salvando = criando || atualizando;

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_VAZIO);
    setDialogOpen(true);
  };

  const abrirEdicao = (fornecedor: Fornecedor) => {
    setEditando(fornecedor);
    setForm({
      nome: fornecedor.nome,
      cnpjCpf: fornecedor.cnpjCpf ?? '',
      telefone: fornecedor.telefone ?? '',
      email: fornecedor.email ?? '',
      observacao: fornecedor.observacao ?? '',
    });
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    const payload = {
      nome: form.nome,
      cnpjCpf: form.cnpjCpf || null,
      telefone: form.telefone || null,
      email: form.email || null,
      observacao: form.observacao || null,
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

  const handleRemover = async (fornecedor: Fornecedor) => {
    if (!confirm(`Excluir o fornecedor "${fornecedor.nome}"?`)) return;
    try {
      await remover(fornecedor.id).unwrap();
    } catch {}
  };

  const colunas: GridColDef[] = [
    { field: 'nome', headerName: 'Fornecedor', flex: 1, minWidth: 180 },
    { field: 'cnpjCpf', headerName: 'CNPJ/CPF', width: 160, valueGetter: (value) => value || '-' },
    { field: 'telefone', headerName: 'Telefone', width: 140, valueGetter: (value) => value || '-' },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 180, valueGetter: (value) => value || '-' },
    {
      field: 'acoes',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); abrirEdicao(params.row); }}>
            <Icon icon="material-symbols:edit-outline" width={18} />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemover(params.row); }}>
            <Icon icon="material-symbols:delete-outline" width={18} />
          </IconButton>
        </Stack>
      ),
    },
  ];

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
          {(erro as any)?.data?.error || 'Erro ao salvar fornecedor'}
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
          Novo fornecedor
        </Button>
      </Stack>

      <Card variant="outlined">
        <DataGrid
          rows={fornecedores}
          columns={colunas}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          pageSizeOptions={[10, 25, 50]}
          autoHeight
          disableColumnMenu
          onRowClick={(params) => abrirEdicao(params.row)}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#FAFAFA',
              borderBottom: '2px solid #E0E0E0',
              fontWeight: 600,
            },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #F0F0F0' },
            '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: '#F5F5F5' } },
          }}
          localeText={{
            ...ptBR.components.MuiDataGrid.defaultProps.localeText,
            noRowsLabel: 'Nenhum fornecedor cadastrado. Ex.: Assaí, Copel, Sanepar, Vivo…',
          }}
        />
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editando ? 'Editar fornecedor' : 'Novo fornecedor'}
          <IconButton onClick={() => setDialogOpen(false)}>
            <Icon icon="material-symbols:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome *"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              fullWidth
              autoFocus
            />
            <Stack direction="row" gap={2}>
              <TextField
                label="CNPJ/CPF"
                value={form.cnpjCpf}
                onChange={(e) => setForm({ ...form, cnpjCpf: e.target.value })}
                fullWidth
              />
              <TextField
                label="Telefone"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                fullWidth
              />
            </Stack>
            <TextField
              label="E-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Observação"
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSalvar}
            disabled={!form.nome.trim() || salvando}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {salvando ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
