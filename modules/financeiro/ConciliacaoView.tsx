'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Icon } from '@iconify/react';
import { formatNumberToCurrency } from '@/config/helpers/currency-mask';
import {
  useListarContasQuery,
  useListarTransacoesQuery,
  useReprocessarTransacoesMutation,
  useSaldoContaQuery,
} from '@/config/redux/api/financeiroApi';
import type { TransacaoBancaria } from '@/types/financeiro.types';
import { SaldoCards } from './components/SaldoCards';
import { ImportarExtratoDialog } from './components/ImportarExtratoDialog';
import { ClassificarDialog } from './components/ClassificarDialog';
import { formatDataBR } from './utils';

type FiltroStatus = 'todas' | 'pendente' | 'conciliada';

export function ConciliacaoView() {
  const router = useRouter();
  const { data: contas = [], isLoading: carregandoContas } = useListarContasQuery();

  const [contaId, setContaId] = useState<string>('');
  const [status, setStatus] = useState<FiltroStatus>('todas');
  const [paginacao, setPaginacao] = useState({ page: 0, pageSize: 25 });
  const [importarOpen, setImportarOpen] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoBancaria | null>(null);

  useEffect(() => {
    if (!contaId && contas.length > 0) {
      setContaId(contas[0].id);
    }
  }, [contas, contaId]);

  const { data: saldo, isLoading: carregandoSaldo } = useSaldoContaQuery(contaId, {
    skip: !contaId,
  });

  const { data: transacoesData, isLoading: carregandoTransacoes, isFetching } =
    useListarTransacoesQuery(
      {
        contaId,
        ...(status !== 'todas' && { status }),
        page: paginacao.page + 1,
        limit: paginacao.pageSize,
      },
      { skip: !contaId },
    );

  const { data: pendentesData } = useListarTransacoesQuery(
    { contaId, status: 'pendente', page: 1, limit: 1 },
    { skip: !contaId },
  );
  const totalPendentes = pendentesData?.total ?? 0;

  const [reprocessar, { isLoading: reprocessando }] = useReprocessarTransacoesMutation();

  const colunas: GridColDef[] = useMemo(
    () => [
      {
        field: 'dataMovimento',
        headerName: 'Data',
        width: 105,
        valueGetter: (value) => formatDataBR(value),
      },
      {
        field: 'descricaoBanco',
        headerName: 'Descrição',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Box sx={{ py: 0.5, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
              {params.row.descricaoBanco}
            </Typography>
            {params.row.historico && (
              <Typography variant="caption" color="text.secondary" noWrap component="div">
                {params.row.historico}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: 'valor',
        headerName: 'Valor',
        width: 140,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const credito = params.row.tipo === 'CREDITO';
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: credito ? '#16a34a' : '#dc2626' }}
            >
              {credito ? '+' : '-'} {formatNumberToCurrency(Number(params.row.valor))}
            </Typography>
          );
        },
      },
      {
        field: 'classificacao',
        headerName: 'Classificação',
        flex: 1,
        minWidth: 220,
        sortable: false,
        renderCell: (params) => {
          const t = params.row as TransacaoBancaria;
          const chips = [
            t.categoria && { label: t.categoria.nome, bg: '#eef2ff', cor: '#4f46e5' },
            t.fornecedor && { label: t.fornecedor.nome, bg: '#f0fdf4', cor: '#15803d' },
            t.area && { label: t.area.nome, bg: '#fff7ed', cor: '#c2410c' },
            t.projeto && { label: t.projeto.nome, bg: '#f0f9ff', cor: '#0369a1' },
          ].filter(Boolean) as { label: string; bg: string; cor: string }[];

          if (chips.length === 0) {
            return (
              <Chip
                label="Pendente"
                size="small"
                sx={{ bgcolor: '#fef9c3', color: '#a16207', fontWeight: 600 }}
              />
            );
          }
          return (
            <Stack direction="row" gap={0.5} sx={{ flexWrap: 'wrap', py: 0.5 }}>
              {chips.map((c) => (
                <Chip
                  key={c.label}
                  label={c.label}
                  size="small"
                  sx={{ bgcolor: c.bg, color: c.cor, fontWeight: 600, maxWidth: 140 }}
                />
              ))}
            </Stack>
          );
        },
      },
      {
        field: 'conciliada',
        headerName: '',
        width: 60,
        sortable: false,
        align: 'center',
        renderCell: (params) =>
          params.row.conciliada ? (
            <Tooltip title={params.row.regraAplicadaId ? 'Classificada por regra' : 'Classificada manualmente'}>
              <Box sx={{ display: 'flex' }}>
                <Icon
                  icon={
                    params.row.regraAplicadaId
                      ? 'material-symbols:bolt'
                      : 'material-symbols:check-circle'
                  }
                  width={20}
                  color="#16a34a"
                />
              </Box>
            </Tooltip>
          ) : null,
      },
    ],
    [],
  );

  if (carregandoContas) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state: nenhuma conta cadastrada
  if (contas.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
        <Icon icon="material-symbols:account-balance-outline" width={56} style={{ opacity: 0.3 }} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: 'text.primary' }}>
          Nenhuma conta bancária cadastrada
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, maxWidth: 420, mx: 'auto' }}>
          Cadastre a conta da igreja com o saldo inicial para começar a importar o extrato e
          conciliar as transações.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => router.push('/financeiro/cadastros')}
        >
          Cadastrar conta
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={1.5}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Conciliação
          </Typography>
          {totalPendentes > 0 && (
            <Chip
              label={`${totalPendentes} pendente${totalPendentes !== 1 ? 's' : ''}`}
              size="small"
              onClick={() => setStatus('pendente')}
              sx={{ bgcolor: '#fef9c3', color: '#a16207', fontWeight: 700, cursor: 'pointer' }}
            />
          )}
        </Stack>
        <Stack direction="row" gap={1}>
          <TextField
            select
            size="small"
            value={contaId}
            onChange={(e) => {
              setContaId(e.target.value);
              setPaginacao((p) => ({ ...p, page: 0 }));
            }}
            sx={{ minWidth: 200 }}
          >
            {contas.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.descricao || `${c.banco} · Ag ${c.agencia} · Cc ${c.conta}`}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip title="Reaplicar todas as regras nas transações pendentes">
            <Button
              variant="outlined"
              size="small"
              onClick={() => reprocessar({ contaId })}
              disabled={reprocessando || totalPendentes === 0}
              startIcon={
                reprocessando ? (
                  <CircularProgress size={14} />
                ) : (
                  <Icon icon="material-symbols:bolt-outline" width={18} />
                )
              }
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Reprocessar
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            onClick={() => setImportarOpen(true)}
            startIcon={<Icon icon="material-symbols:cloud-download-outline" width={18} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            Importar extrato
          </Button>
        </Stack>
      </Stack>

      {/* Cards de saldo */}
      <Box sx={{ mb: 2.5 }}>
        <SaldoCards saldo={saldo} isLoading={carregandoSaldo} />
      </Box>

      {/* Filtro de status */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <ToggleButtonGroup
          value={status}
          exclusive
          size="small"
          onChange={(_, v) => {
            if (v) {
              setStatus(v);
              setPaginacao((p) => ({ ...p, page: 0 }));
            }
          }}
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              '&.Mui-selected': { bgcolor: '#eef2ff', color: '#4f46e5' },
            },
          }}
        >
          <ToggleButton value="todas">Todas</ToggleButton>
          <ToggleButton value="pendente">Pendentes</ToggleButton>
          <ToggleButton value="conciliada">Conciliadas</ToggleButton>
        </ToggleButtonGroup>
        {isFetching && <CircularProgress size={18} />}
      </Stack>

      {/* Tabela */}
      <Card variant="outlined">
        <DataGrid
          rows={transacoesData?.transacoes ?? []}
          columns={colunas}
          rowCount={transacoesData?.total ?? 0}
          loading={carregandoTransacoes}
          paginationMode="server"
          paginationModel={paginacao}
          onPaginationModelChange={setPaginacao}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={(params: GridRowParams) =>
            setTransacaoSelecionada(params.row as TransacaoBancaria)
          }
          autoHeight
          disableColumnMenu
          rowHeight={56}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#FAFAFA',
              borderBottom: '2px solid #E0E0E0',
              fontWeight: 600,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #F0F0F0',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              '&:hover': { bgcolor: '#F5F5F5' },
            },
          }}
          localeText={{
            ...ptBR.components.MuiDataGrid.defaultProps.localeText,
            noRowsLabel:
              status === 'pendente'
                ? 'Nenhuma transação pendente 🎉'
                : 'Nenhuma transação. Importe o extrato para começar.',
          }}
        />
      </Card>

      {/* Dialogs */}
      {contaId && (
        <ImportarExtratoDialog
          open={importarOpen}
          contaId={contaId}
          onClose={() => setImportarOpen(false)}
        />
      )}
      <ClassificarDialog
        transacao={transacaoSelecionada}
        onClose={() => setTransacaoSelecionada(null)}
      />
    </Box>
  );
}
