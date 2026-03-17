"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Stack,
  Divider,
  InputAdornment,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { criarEventoSchema, type CriarEventoSchema } from "./schemas/criar-evento.schema";
import { useCadastrarEventoMutation } from "@/config/redux/api/eventosApi";
import type { ProdutoEventoRequest } from "@/config/redux/api/eventosApi";
import RichTextEditor from "./components/RichTextEditor";
import { CurrencyMaskCustom, formatCurrencyToNumber } from "@/config/helpers/currency-mask";

export default function CriarEventoModule() {
  const router = useRouter();
  const [cadastrarEvento, { isLoading }] = useCadastrarEventoMutation();

  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CriarEventoSchema>({
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

  const onSubmit = async (data: CriarEventoSchema) => {
    try {
      const produtosPayload: ProdutoEventoRequest[] = (data.produtos || []).map((p) => ({
        nome: p.nome,
        descricao: p.descricao,
        valor: formatCurrencyToNumber(p.valor),
      }));

      const result = await cadastrarEvento({
        nome: data.nome,
        data_inicio: new Date(data.data_inicio).toISOString(),
        data_fim: new Date(data.data_fim).toISOString(),
        descricao: data.descricao || undefined,
        selecao_unica_produto: data.selecao_unica_produto,
        produtos: produtosPayload.length > 0 ? produtosPayload : undefined,
      }).unwrap();

      setAlert({
        open: true,
        message: "Evento criado com sucesso!",
        severity: "success",
      });

      router.push(`${process.env.NEXT_PUBLIC_APP_URL}/eventos/${result.id}`);
    } catch (error: any) {
      setAlert({
        open: true,
        message: error?.data?.error || "Erro ao criar evento",
        severity: "error",
      });
    }
  };

  const selecao_unica_produto = watch("selecao_unica_produto");

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }}>
        <IconButton
          onClick={() => router.push("/eventos")}
          sx={{
            bgcolor: "#F5F5F5",
            "&:hover": { bgcolor: "#E0E0E0" },
          }}
        >
          <IconifyIcon icon="material-symbols:arrow-back" width={18} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
          Criar evento
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Informações Básicas */}
          <Grid size={12}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 3, color: "#1A1A1A" }}
              >
                Informações do Evento
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <Controller
                    name="nome"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nome do evento *"
                        fullWidth
                        error={!!errors.nome}
                        helperText={errors.nome?.message}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="data_inicio"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de início *"
                        type="datetime-local"
                        fullWidth
                        error={!!errors.data_inicio}
                        helperText={errors.data_inicio?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="data_fim"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de término *"
                        type="datetime-local"
                        fullWidth
                        error={!!errors.data_fim}
                        helperText={errors.data_fim?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Controller
                    name="descricao"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Descrição"
                        fullWidth
                        multiline
                        minRows={3}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* <Grid size={12}>
                  <TextField
                    label="URL da imagem (opcional)"
                    fullWidth
                    value={imagemUrl}
                    onChange={(e) => setImagemUrl(e.target.value)}
                    placeholder="https://..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid> */}
              </Grid>
            </Card>
          </Grid>

          {/* Produtos */}
          <Grid size={12}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#1A1A1A" }}
                  >
                    Produtos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Adicione produtos ou opções vinculadas ao evento
                    (opcional)
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    <IconifyIcon
                      icon="material-symbols:add"
                      width={18}
                    />
                  }
                  onClick={() => append({ nome: "", descricao: "", valor: "" })}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Adicionar produto
                </Button>
              </Stack>

              {fields.length > 0 && (
                <Box>
                  <Controller
                    name="selecao_unica_produto"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Seleção de produto obrigatória
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {value
                                ? "O participante será obrigado a selecionar um produto ao se inscrever"
                                : "O participante poderá se inscrever sem selecionar um produto"}
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 2, ml: 0 }}
                      />
                    )}
                  />

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    {fields.map((field, index) => (
                      <Card
                        key={field.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "#FAFAFA",
                          position: "relative",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => remove(index)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "#999",
                            "&:hover": { color: "#d32f2f" },
                          }}
                        >
                          <IconifyIcon
                            icon="material-symbols:close"
                            width={18}
                          />
                        </IconButton>

                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "#666",
                            mb: 1.5,
                            display: "block",
                          }}
                        >
                          Produto {index + 1}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <Controller
                              name={`produtos.${index}.nome`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Nome do produto"
                                  size="small"
                                  error={!!errors.produtos?.[index]?.nome}
                                  helperText={errors.produtos?.[index]?.nome?.message}
                                  sx={{
                                    minWidth: '300px',
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 1.5,
                                    },
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }} mb={2}>
                            <Controller
                              name={`produtos.${index}.descricao`}
                              control={control}
                              render={({ field }) => (
                                <RichTextEditor
                                  label="Descrição"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                />
                              )}
                            />
                            {errors.produtos?.[index]?.descricao && (
                              <Typography color="error" variant="caption">
                                {errors.produtos?.[index]?.descricao?.message}
                              </Typography>
                            )}
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Controller
                              name={`produtos.${index}.valor`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Valor *"
                                  size="small"
                                  placeholder="R$ 0,00"
                                  error={!!errors.produtos?.[index]?.valor}
                                  helperText={errors.produtos?.[index]?.valor?.message}
                                  disabled={isLoading}
                                  slotProps={{
                                    inputLabel: {
                                      shrink: true,
                                    },
                                  }}
                                  InputProps={{
                                    inputComponent: CurrencyMaskCustom as any,
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 1.5,
                                    },
                                  }}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {fields.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "#999",
                  }}
                >
                  <IconifyIcon
                    icon="material-symbols:inventory-2-outline"
                    width={40}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Nenhum produto adicionado
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Submit */}
          <Grid size={12}>
            <Stack direction="row" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => router.push("/eventos")}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !isValid}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  bgcolor: "#5B5FED",
                  "&:hover": { bgcolor: "#4A4EDC" },
                  "&:disabled": {
                    bgcolor: "#E0E0E0",
                    color: "#999",
                  }
                }}
              >
                {isLoading ? "Criando..." : "Criar evento"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
