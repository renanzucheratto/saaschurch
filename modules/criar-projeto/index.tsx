"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { criarProjetoSchema, type CriarProjetoSchema } from "./schemas/criar-projeto.schema";
import { useCadastrarProjetoMutation } from "@/config/redux/api/projetosApi";
import type { ItemProjetoRequest } from "@/config/redux/api/projetosApi";
import RichTextEditor from "@/modules/criar-evento/components/RichTextEditor";
import {
  CurrencyMaskCustom,
  formatCurrencyToNumber,
  formatNumberToCurrency,
} from "@/config/helpers/currency-mask";
import { useAppSelector } from "@/config/redux/store";
import { selectCurrentUser } from "@/config/redux/slices/authSlice";

const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: 1.5 } };

function TotalProjeto({ control }: { control: any }) {
  const itens = useWatch({ control, name: "itens" }) as CriarProjetoSchema["itens"] | undefined;

  const total = (itens || []).reduce((acc, item) => {
    const qtd = Number(item?.quantidade) || 0;
    const valor = formatCurrencyToNumber(item?.valor_unit || "");
    return acc + qtd * valor;
  }, 0);

  return (
    <Alert
      severity="info"
      icon={<IconifyIcon icon="material-symbols:info-outline" width={20} />}
      sx={{ borderRadius: 1.5, alignItems: "center" }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Total planejado: {formatNumberToCurrency(total)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Qualquer valor gasto acima do total planejado não será reembolsado pela igreja — a
        responsabilidade financeira é do líder do projeto.
      </Typography>
    </Alert>
  );
}

export default function CriarProjetoModule() {
  const router = useRouter();
  const [cadastrarProjeto, { isLoading }] = useCadastrarProjetoMutation();
  const currentUser = useAppSelector(selectCurrentUser);

  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const getErrorMessage = (value: unknown): string => {
    if (typeof value === "object" && value !== null && "data" in value) {
      const data = (value as { data?: unknown }).data;
      if (typeof data === "object" && data !== null && "error" in data) {
        const errorValue = (data as { error?: unknown }).error;
        if (typeof errorValue === "string") return errorValue;
      }
    }
    return "Erro ao criar projeto";
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CriarProjetoSchema>({
    resolver: zodResolver(criarProjetoSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      descricao: "",
      ideias: "",
      data_inicio: "",
      data_fim: "",
      itens: [{ nome: "", descricao: "", quantidade: "1", valor_unit: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });

  const onSubmit = async (data: CriarProjetoSchema) => {
    try {
      const itensPayload: ItemProjetoRequest[] = data.itens.map((item) => ({
        nome: item.nome,
        descricao: item.descricao || null,
        quantidade: Number(item.quantidade) || 1,
        valor_unit: formatCurrencyToNumber(item.valor_unit),
      }));

      const result = await cadastrarProjeto({
        nome: data.nome,
        descricao: data.descricao || null,
        ideias: data.ideias || null,
        data_inicio: data.data_inicio ? `${data.data_inicio}T00:00:00.000Z` : null,
        data_fim: data.data_fim ? `${data.data_fim}T00:00:00.000Z` : null,
        itens: itensPayload,
      }).unwrap();

      setAlert({ open: true, message: "Projeto criado com sucesso!", severity: "success" });
      router.push(`/projetos/${result.id}`);
    } catch (error: unknown) {
      setAlert({ open: true, message: getErrorMessage(error), severity: "error" });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }}>
        <IconButton
          onClick={() => router.push("/projetos")}
          sx={{ bgcolor: "#F5F5F5", "&:hover": { bgcolor: "#E0E0E0" } }}
        >
          <IconifyIcon icon="material-symbols:arrow-back" width={18} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
          Criar projeto
        </Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Informações Básicas */}
          <Grid size={12}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: "#1A1A1A" }}>
                Informações do Projeto
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={12}>
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
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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
                        minRows={2}
                        sx={inputSx}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Ideias / Detalhamento */}
          <Grid size={12}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "#1A1A1A" }}>
                Ideias e detalhamento
              </Typography>
              <Controller
                name="ideias"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    label="Descreva as ideias, objetivos e o planejamento do projeto"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </Card>
          </Grid>

          {/* Itens */}
          <Grid size={12}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1A1A1A" }}>
                    Itens do projeto
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Liste os insumos e seus valores para compor o orçamento
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconifyIcon icon="material-symbols:add" width={18} />}
                  onClick={() =>
                    append({ nome: "", descricao: "", quantidade: "1", valor_unit: "" })
                  }
                  sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
                >
                  Adicionar item
                </Button>
              </Stack>

              {errors.itens?.message && (
                <Typography color="error" variant="caption" sx={{ display: "block", mb: 1 }}>
                  {errors.itens.message}
                </Typography>
              )}

              <Stack spacing={2}>
                {fields.map((field, index) => (
                  <Card
                    key={field.id}
                    variant="outlined"
                    sx={{ p: 2, bgcolor: "#FAFAFA", position: "relative" }}
                  >
                    {fields.length > 1 && (
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
                        <IconifyIcon icon="material-symbols:close" width={18} />
                      </IconButton>
                    )}

                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#666", mb: 1.5, display: "block" }}
                    >
                      Item {index + 1}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
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
                      <Grid size={{ xs: 6, md: 3 }}>
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
                      <Grid size={{ xs: 6, md: 3 }}>
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
                            <TextField
                              {...field}
                              label="Descrição (opcional)"
                              size="small"
                              fullWidth
                              sx={inputSx}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />
              <TotalProjeto control={control} />
            </Card>
          </Grid>

          {/* Submit */}
          <Grid size={12}>
            <Stack direction="row" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => router.push("/projetos")}
                sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, px: 4 }}
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
                  "&:disabled": { bgcolor: "#E0E0E0", color: "#999" },
                }}
              >
                {isLoading ? "Criando..." : "Criar projeto"}
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
