import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Icon as IconifyIcon } from '@iconify/react';
import { ProdutoParticipante, Parcela } from '@/types/evento.types';
import {
  useAtualizarQuantidadeParcelasMutation,
  useCadastrarParcelaMutation,
  useEditarParcelaMutation,
  useExcluirParcelaMutation,
} from '@/config/redux/api/eventosApi';
import { CurrencyMaskCustom, formatCurrencyToNumber } from '@/config/helpers/currency-mask';
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface GerenciarPagamentoProps {
  eventoId: string;
  participanteId: string;
  produto: ProdutoParticipante;
}

const parcelaSchema = z.object({
  valor_pago: z.string().min(1, 'O valor é obrigatório').refine(val => formatCurrencyToNumber(val) > 0, "O valor deve ser maior que 0"),
  metodo_pagamento: z.string().min(1, 'Selecione um método'),
  numero_vezes: z.string().optional(),
  descricao: z.string().optional(),
  data_pagamento: z.string().optional(),
});

type ParcelaForm = z.infer<typeof parcelaSchema>;

export default function GerenciarPagamento({ eventoId, participanteId, produto }: GerenciarPagamentoProps) {
  const [atualizarQuantidade] = useAtualizarQuantidadeParcelasMutation();
  const [cadastrarParcela, { isLoading: isLoadingCadastrar }] = useCadastrarParcelaMutation();
  const [editarParcela, { isLoading: isLoadingEditar }] = useEditarParcelaMutation();
  const [excluirParcela] = useExcluirParcelaMutation();

  const [isEditingQtde, setIsEditingQtde] = useState(false);
  const [qtdeParcelas, setQtdeParcelas] = useState(produto.quantidade_parcelas || 1);

  const [openModal, setOpenModal] = useState(false);
  const [parcelaEmEdicao, setParcelaEmEdicao] = useState<Parcela | null>(null);

  const { control, handleSubmit, reset, watch } = useForm<ParcelaForm>({
    resolver: zodResolver(parcelaSchema),
    defaultValues: {
      valor_pago: '',
      metodo_pagamento: 'Pix',
      numero_vezes: '',
      descricao: '',
      data_pagamento: new Date().toISOString().slice(0, 10),
    }
  });

  const metodoSelecionado = watch('metodo_pagamento');

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'QUITADO':
      case 'NAO_APLICA':
        return 'success';
      case 'PARCIALMENTE_PAGO':
        return 'warning';
      case 'PENDENTE':
      default:
        return 'error';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'QUITADO': return 'Quitado';
      case 'NAO_APLICA': return 'N/A';
      case 'PARCIALMENTE_PAGO': return 'Parcialmente Pago';
      case 'PENDENTE': return 'Pendente';
      default: return 'Pendente';
    }
  };

  const handleSaveQtde = async () => {
    try {
      await atualizarQuantidade({
        eventoId,
        participanteId,
        produtoId: produto.produtoId,
        quantidade_parcelas: Number(qtdeParcelas)
      }).unwrap();
      setIsEditingQtde(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar quantidade de parcelas');
    }
  };

  const openForm = (parcela?: Parcela) => {
    if (parcela) {
      setParcelaEmEdicao(parcela);
      reset({
        valor_pago: Number(parcela.valor_pago).toFixed(2).replace('.', ','),
        metodo_pagamento: parcela.metodo_pagamento || 'Pix',
        numero_vezes: parcela.numero_vezes ? String(parcela.numero_vezes) : '',
        descricao: parcela.descricao || '',
        data_pagamento: parcela.data_pagamento ? new Date(parcela.data_pagamento).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
    } else {
      setParcelaEmEdicao(null);
      reset({
        valor_pago: '',
        metodo_pagamento: 'Pix',
        numero_vezes: '',
        descricao: '',
        data_pagamento: new Date().toISOString().slice(0, 10),
      });
    }
    setOpenModal(true);
  };

  const submitForm = async (data: ParcelaForm) => {
    try {
      const payload = {
        valor_pago: formatCurrencyToNumber(data.valor_pago),
        metodo_pagamento: data.metodo_pagamento,
        numero_vezes: data.metodo_pagamento === 'Crédito' ? Number(data.numero_vezes) : undefined,
        descricao: data.descricao || undefined,
        data_pagamento: data.data_pagamento ? new Date(data.data_pagamento).toISOString() : undefined,
      };

      if (parcelaEmEdicao) {
        await editarParcela({
          eventoId,
          participanteId,
          produtoId: produto.produtoId,
          parcelaId: parcelaEmEdicao.id,
          data: payload,
        }).unwrap();
      } else {
        await cadastrarParcela({
          eventoId,
          participanteId,
          produtoId: produto.produtoId,
          data: payload,
        }).unwrap();
      }
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar parcela');
    }
  };

  const handleDeleteParcela = async (parcelaId: string) => {
    if (confirm('Deseja excluir esta parcela?')) {
      try {
        await excluirParcela({
          eventoId,
          participanteId,
          produtoId: produto.produtoId,
          parcelaId,
        }).unwrap();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir parcela');
      }
    }
  };

  if (!produto.exigePagamento) {
    return (
      <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2, mb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight={600}>{produto.nome}</Typography>
          <Chip label="N/A" color="success" size="small" sx={{ fontWeight: 600 }} />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valor)}
        </Typography>
      </Box>
    );
  }

  const parseValor = (v: string | number) => typeof v === 'string' ? parseFloat(v) : v;
  const totalPago = (produto.parcelas || []).reduce((acc, p) => acc + parseValor(p.valor_pago), 0);

  return (
    <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2, mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="body1" fontWeight={600}>{produto.nome}</Typography>
          <Typography variant="body2" color="text.secondary">
            Valor Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valor)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
          </Typography>
        </Box>
        <Chip label={getStatusLabel(produto.status)} color={getStatusColor(produto.status)} size="small" sx={{ fontWeight: 600 }} />
      </Stack>

      {/* Controle de Parcelas */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="body2" fontWeight={600}>Qtd. Parcelas Acordadas:</Typography>
        {isEditingQtde ? (
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              type="number"
              value={qtdeParcelas}
              onChange={(e) => setQtdeParcelas(Number(e.target.value))}
              sx={{ width: 80, bgcolor: 'white' }}
            />
            <Button size="small" variant="contained" onClick={handleSaveQtde}>Salvar</Button>
            <Button size="small" onClick={() => setIsEditingQtde(false)}>Cancelar</Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{produto.quantidade_parcelas || 1}</Typography>
            <IconButton size="small" onClick={() => setIsEditingQtde(true)}>
              <IconifyIcon icon="material-symbols:edit" width={16} />
            </IconButton>
          </Stack>
        )}
      </Stack>

      <Typography variant="caption" fontWeight={600} display="block" mb={1}>Lançamentos</Typography>
      <Stack spacing={1} mb={2}>
        {produto.parcelas?.map((parcela, index) => (
          <Box key={parcela.id} sx={{ bgcolor: 'white', p: 1.5, borderRadius: 1, border: '1px solid #E0E0E0' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {index + 1}ª Parcela - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseValor(parcela.valor_pago))}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {parcela.metodo_pagamento} {parcela.numero_vezes ? `(${parcela.numero_vezes}x)` : ''}
                  {parcela.data_pagamento ? ` • ${new Date(parcela.data_pagamento).toLocaleDateString()}` : ''}
                </Typography>
                {parcela.descricao && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Obs: {parcela.descricao}
                  </Typography>
                )}
              </Box>
              <Stack direction="row">
                <IconButton size="small" onClick={() => openForm(parcela)}>
                  <IconifyIcon icon="material-symbols:edit" width={18} />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteParcela(parcela.id)}>
                  <IconifyIcon icon="material-symbols:delete" width={18} />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        ))}
        {(!produto.parcelas || produto.parcelas.length === 0) && (
          <Typography variant="caption" color="text.secondary">Nenhuma parcela lançada.</Typography>
        )}
      </Stack>

      <Button
        variant="outlined"
        size="small"
        startIcon={<IconifyIcon icon="material-symbols:add" />}
        onClick={() => openForm()}
        disabled={produto.status === 'QUITADO' || (!produto.parcelas || produto.parcelas.length >= (produto.quantidade_parcelas || 1))}
      >
        Lançar Parcela
      </Button>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{parcelaEmEdicao ? 'Editar Parcela' : 'Lançar Parcela'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            <Controller
              name="valor_pago"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Valor Pago *"
                  fullWidth
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  InputProps={{ inputComponent: CurrencyMaskCustom as any }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="data_pagamento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data do Pagamento"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="metodo_pagamento"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Método de Pagamento *"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="Pix">Pix</MenuItem>
                  <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                  <MenuItem value="Débito">Débito</MenuItem>
                  <MenuItem value="Crédito">Crédito</MenuItem>
                </TextField>
              )}
            />

            {metodoSelecionado === 'Crédito' && (
              <Controller
                name="numero_vezes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número de Vezes"
                    type="number"
                    fullWidth
                  />
                )}
              />
            )}

            <Controller
              name="descricao"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição (Opcional)"
                  multiline
                  rows={2}
                  fullWidth
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} disabled={isLoadingCadastrar || isLoadingEditar}>Cancelar</Button>
          <LoadingButton 
            onClick={handleSubmit(submitForm)} 
            variant="contained" 
            sx={{ bgcolor: '#5B5FED' }}
            loading={isLoadingCadastrar || isLoadingEditar}
          >
            Salvar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
