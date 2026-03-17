import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Card,
} from '@mui/material';
import { Icon as IconifyIcon } from '@iconify/react';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { criarEventoSchema, type CriarEventoSchema } from "@/modules/criar-evento/schemas/criar-evento.schema";
import { useEditarEventoMutation } from '@/config/redux/api/eventosApi';
import type { ProdutoEventoRequest } from "@/config/redux/api/eventosApi";
import { EventoDetalhes } from '@/types/evento.types';
import RichTextEditor from "@/modules/criar-evento/components/RichTextEditor";
import { CurrencyMaskCustom, formatCurrencyToNumber } from "@/config/helpers/currency-mask";

interface EventoDrawerProps {
  open: boolean;
  onClose: () => void;
  evento: EventoDetalhes | null;
}

// Helper para converter data pro formato aceito pelo input datetime-local no formato YYYY-MM-DDThh:mm
const formatDatetimeLocal = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EventoDrawer({ open, onClose, evento }: EventoDrawerProps) {
  const [editarEvento, { isLoading }] = useEditarEventoMutation();
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm({
    resolver: zodResolver(criarEventoSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      data_inicio: "",
      data_fim: "",
      descricao: "",
      selecao_unica_produto: true,
      produtos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "produtos",
  });

  useEffect(() => {
    if (evento && open) {
      const resetData = {
        nome: evento.nome,
        data_inicio: formatDatetimeLocal(evento.data_inicio || ""),
        data_fim: formatDatetimeLocal(evento.data_fim || ""),
        descricao: evento.descricao || "",
        selecao_unica_produto: evento.selecao_unica_produto,
        produtos: evento.produtos?.map(p => ({
          id: p.id,
          nome: p.nome,
          descricao: p.descricao || "",
          valor: p.valor.toFixed(2).replace(".", ","),
        })) || [],
      };
      reset(resetData);
    }
  }, [evento, open, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (!evento) return;

      const produtosPayload: ProdutoEventoRequest[] = (data.produtos || []).map((p: any) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        valor: typeof p.valor === "string" ? formatCurrencyToNumber(p.valor) : p.valor,
      }));

      await editarEvento({
        eventoId: evento.id,
        data: {
          nome: data.nome,
          data_inicio: new Date(data.data_inicio).toISOString(),
          data_fim: new Date(data.data_fim).toISOString(),
          descricao: data.descricao || undefined,
          selecao_unica_produto: data.selecao_unica_produto,
          produtos: produtosPayload.length > 0 ? produtosPayload : undefined,
        }
      }).unwrap();

      setAlert({ open: true, message: "Evento atualizado com sucesso!", severity: "success" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setAlert({ open: true, message: error?.data?.error || "Erro ao atualizar evento", severity: "error" });
    }
  };

  if (!evento) return null;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 800 }, p: 0 } }}
      >
        <Box sx={{ px: 3, height: 61, display: 'flex', flexShrink: 'inherit', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={700}>Editar Evento</Typography>
          <IconButton onClick={onClose} size="small"><IconifyIcon icon="mdi:close" width={24} /></IconButton>
        </Box>

        <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }} component="form" id="evento-form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Informações Básicas</Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Controller name="nome" control={control} render={({ field }) => (
                    <TextField {...field} label="Nome do evento *" fullWidth error={!!errors.nome} helperText={errors.nome?.message as string} />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="data_inicio" control={control} render={({ field }) => (
                    <TextField {...field} label="Data de início *" type="datetime-local" fullWidth error={!!errors.data_inicio} helperText={errors.data_inicio?.message as string} slotProps={{ inputLabel: { shrink: true } }} />
                  )} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="data_fim" control={control} render={({ field }) => (
                    <TextField {...field} label="Data de término *" type="datetime-local" fullWidth error={!!errors.data_fim} helperText={errors.data_fim?.message as string} slotProps={{ inputLabel: { shrink: true } }} />
                  )} />
                </Grid>
                <Grid size={12}>
                  <Controller name="descricao" control={control} render={({ field }) => (
                    <TextField {...field} label="Descrição" fullWidth multiline minRows={3} />
                  )} />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Produtos</Typography>
                  <Typography variant="caption" color="text.secondary">Gerencie os produtos do evento</Typography>
                </Box>
                <Button variant="outlined" size="small" startIcon={<IconifyIcon icon="material-symbols:add" />} onClick={() => append({ nome: "", descricao: "", valor: "" } as any)}>Adicionar produto</Button>
              </Stack>

              <Controller name="selecao_unica_produto" control={control} render={({ field: { value, onChange } }) => (
                <FormControlLabel control={<Switch checked={value} onChange={(e) => onChange(e.target.checked)} />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Seleção de produto obrigatória</Typography>} sx={{ mb: 2, ml: 0 }} />
              )} />

              <Stack spacing={2}>
                {fields.map((field: any, index) => (
                  <Card key={field.id} variant="outlined" sx={{ p: 2, bgcolor: "#FAFAFA", position: "relative" }}>
                    <IconButton size="small" onClick={() => remove(index)} sx={{ position: "absolute", top: 8, right: 8, color: "error.main" }}>
                      <IconifyIcon icon="material-symbols:delete-outline" width={18} />
                    </IconButton>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#666", mb: 1.5, display: "block" }}>Produto {index + 1}</Typography>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <Controller name={`produtos.${index}.nome`} control={control} render={({ field }) => (
                          <TextField {...field} label="Nome" size="small" fullWidth error={!!(errors.produtos as any)?.[index]?.nome} helperText={(errors.produtos as any)?.[index]?.nome?.message} />
                        )} />
                      </Grid>
                      <Grid size={12}>
                        <Controller name={`produtos.${index}.descricao`} control={control} render={({ field }) => (
                          <RichTextEditor label="Descrição" value={field.value || ""} onChange={field.onChange} />
                        )} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller name={`produtos.${index}.valor`} control={control} render={({ field }) => (
                          <TextField {...field} label="Valor *" size="small" fullWidth placeholder="R$ 0,00" error={!!(errors.produtos as any)?.[index]?.valor} helperText={(errors.produtos as any)?.[index]?.valor?.message} InputProps={{ inputComponent: CurrencyMaskCustom as any }} slotProps={{ inputLabel: { shrink: true } }} />
                        )} />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" disabled={isLoading} onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="evento-form" variant="contained" loading={isLoading} disabled={isLoading} sx={{ bgcolor: "#5B5FED", "&:hover": { bgcolor: "#4A4EDC" } }}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </Box>
      </Drawer>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} variant="filled" sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}
