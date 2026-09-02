"use client";

import { useEffect, useState } from "react";
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
  Snackbar,
  Alert,
  Card,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { criarProjetoSchema, type CriarProjetoSchema } from "@/modules/criar-projeto/schemas/criar-projeto.schema";
import { useEditarProjetoMutation } from "@/config/redux/api/projetosApi";
import type { ItemProjetoRequest } from "@/config/redux/api/projetosApi";
import type { ProjetoDetalhes } from "@/types/projeto.types";
import RichTextEditor from "@/modules/criar-evento/components/RichTextEditor";
import { CurrencyMaskCustom, formatCurrencyToNumber } from "@/config/helpers/currency-mask";
import { formatDateInput } from "@/config/helpers/format-date";
import { getApiErrorMessage } from "@/config/helpers/get-api-error-message";

const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: 1.5 } };

interface ProjetoDrawerProps {
  open: boolean;
  onClose: () => void;
  projeto: ProjetoDetalhes | null;
}

export default function ProjetoDrawer({ open, onClose, projeto }: ProjetoDrawerProps) {
  const [editarProjeto, { isLoading }] = useEditarProjetoMutation();
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CriarProjetoSchema>({
    resolver: zodResolver(criarProjetoSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      descricao: "",
      ideias: "",
      data_inicio: "",
      data_fim: "",
      itens: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });

  useEffect(() => {
    if (projeto && open) {
      reset({
        nome: projeto.nome,
        descricao: projeto.descricao || "",
        ideias: projeto.ideias || "",
        data_inicio: formatDateInput(projeto.data_inicio),
        data_fim: formatDateInput(projeto.data_fim),
        itens: projeto.itens.map((item) => ({
          nome: item.nome,
          descricao: item.descricao || "",
          quantidade: String(item.quantidade),
          valor_unit: Number(item.valor_unit).toFixed(2).replace(".", ","),
        })),
      });
    }
  }, [projeto, open, reset]);

  const onSubmit = async (data: CriarProjetoSchema) => {
    if (!projeto) return;
    try {
      const itensPayload: ItemProjetoRequest[] = data.itens.map((item) => ({
        nome: item.nome,
        descricao: item.descricao || null,
        quantidade: Number(item.quantidade) || 1,
        valor_unit: formatCurrencyToNumber(item.valor_unit),
      }));

      await editarProjeto({
        projetoId: projeto.id,
        data: {
          nome: data.nome,
          descricao: data.descricao || null,
          ideias: data.ideias || null,
          data_inicio: data.data_inicio ? `${data.data_inicio}T00:00:00.000Z` : null,
          data_fim: data.data_fim ? `${data.data_fim}T00:00:00.000Z` : null,
          itens: itensPayload,
        },
      }).unwrap();

      setAlert({ open: true, message: "Projeto atualizado com sucesso!", severity: "success" });
      setTimeout(() => onClose(), 1200);
    } catch (error) {
      setAlert({ open: true, message: getApiErrorMessage(error, "Erro ao editar projeto"), severity: "error" });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 600 } } }}
    >
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Editar projeto
          </Typography>
          <IconButton onClick={onClose}>
            <IconifyIcon icon="material-symbols:close" width={20} />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ flex: 1, overflowY: "auto" }}>
          <Stack spacing={2.5}>
            <Controller
              name="nome"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome do projeto *"
                  fullWidth
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                  sx={inputSx}
                />
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="data_inicio"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de início"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputSx}
                  />
                )}
              />
              <Controller
                name="data_fim"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de término"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputSx}
                  />
                )}
              />
            </Stack>

            <Controller
              name="descricao"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Descrição" fullWidth multiline minRows={2} sx={inputSx} />
              )}
            />

            <Controller
              name="ideias"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  label="Ideias e detalhamento"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Itens do projeto
              </Typography>
              <Button
                size="small"
                startIcon={<IconifyIcon icon="material-symbols:add" width={16} />}
                onClick={() => append({ nome: "", descricao: "", quantidade: "1", valor_unit: "" })}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Adicionar
              </Button>
            </Stack>

            {errors.itens?.message && (
              <Typography color="error" variant="caption">
                {errors.itens.message}
              </Typography>
            )}

            {fields.map((field, index) => (
              <Card key={field.id} variant="outlined" sx={{ p: 2, bgcolor: "#FAFAFA", position: "relative" }}>
                {fields.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => remove(index)}
                    sx={{ position: "absolute", top: 8, right: 8, color: "#999", "&:hover": { color: "#d32f2f" } }}
                  >
                    <IconifyIcon icon="material-symbols:close" width={16} />
                  </IconButton>
                )}
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Controller
                      name={`itens.${index}.nome`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nome do item *"
                          size="small"
                          fullWidth
                          error={!!errors.itens?.[index]?.nome}
                          helperText={errors.itens?.[index]?.nome?.message}
                          sx={inputSx}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Controller
                      name={`itens.${index}.quantidade`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Quantidade *"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ min: 1 }}
                          error={!!errors.itens?.[index]?.quantidade}
                          helperText={errors.itens?.[index]?.quantidade?.message}
                          sx={inputSx}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Controller
                      name={`itens.${index}.valor_unit`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor unitário *"
                          size="small"
                          fullWidth
                          placeholder="R$ 0,00"
                          error={!!errors.itens?.[index]?.valor_unit}
                          helperText={errors.itens?.[index]?.valor_unit?.message}
                          slotProps={{ inputLabel: { shrink: true } }}
                          InputProps={{ inputComponent: CurrencyMaskCustom as never }}
                          sx={inputSx}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Controller
                      name={`itens.${index}.descricao`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Descrição (opcional)" size="small" fullWidth sx={inputSx} />
                      )}
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Stack direction="row" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={onClose} sx={{ textTransform: "none", fontWeight: 600 }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#5B5FED",
                "&:hover": { bgcolor: "#4A4EDC" },
              }}
            >
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alert.severity} variant="filled" sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Drawer>
  );
}
