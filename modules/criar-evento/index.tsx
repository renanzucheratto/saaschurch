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
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Stack,
  Divider,
  InputAdornment,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { useCadastrarEventoMutation } from "@/config/redux/api/eventosApi";
import type { ProdutoEventoRequest } from "@/config/redux/api/eventosApi";
import RichTextEditor from "./components/RichTextEditor";

interface ProdutoForm {
  nome: string;
  descricao: string;
  valor: string;
}

const emptyProduto: ProdutoForm = { nome: "", descricao: "", valor: "" };

export default function CriarEventoModule() {
  const router = useRouter();
  const [cadastrarEvento, { isLoading }] = useCadastrarEventoMutation();

  // Event fields
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [selecaoUnicaProduto, setSelecaoUnicaProduto] = useState(true);

  // Products
  const [produtos, setProdutos] = useState<ProdutoForm[]>([]);

  // Alert
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!dataInicio) newErrors.dataInicio = "Data de início é obrigatória";
    if (!dataFim) newErrors.dataFim = "Data de término é obrigatória";
    if (dataInicio && dataFim && new Date(dataInicio) > new Date(dataFim)) {
      newErrors.dataFim = "Data de término deve ser posterior à data de início";
    }

    produtos.forEach((p, i) => {
      if (!p.nome.trim()) newErrors[`produto_${i}_nome`] = "Nome é obrigatório";
      if (!p.valor || isNaN(Number(p.valor)) || Number(p.valor) < 0) {
        newErrors[`produto_${i}_valor`] = "Valor inválido";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduto = () => {
    setProdutos([...produtos, { ...emptyProduto }]);
  };

  const handleRemoveProduto = (index: number) => {
    setProdutos(produtos.filter((_, i) => i !== index));
  };

  const handleProdutoChange = (
    index: number,
    field: keyof ProdutoForm,
    value: string
  ) => {
    const updated = [...produtos];
    updated[index] = { ...updated[index], [field]: value };
    setProdutos(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const produtosPayload: ProdutoEventoRequest[] = produtos.map((p) => ({
        nome: p.nome,
        descricao: p.descricao || undefined,
        valor: Number(p.valor),
      }));

      const result = await cadastrarEvento({
        nome,
        data_inicio: new Date(dataInicio).toISOString(),
        data_fim: new Date(dataFim).toISOString(),
        descricao: descricao || undefined,
        imagem_url: imagemUrl || undefined,
        selecao_unica_produto: selecaoUnicaProduto,
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

      <Box component="form" onSubmit={handleSubmit}>
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
                  <TextField
                    label="Nome do evento *"
                    fullWidth
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    error={!!errors.nome}
                    helperText={errors.nome}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Data de início *"
                    type="datetime-local"
                    fullWidth
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    error={!!errors.dataInicio}
                    helperText={errors.dataInicio}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Data de término *"
                    type="datetime-local"
                    fullWidth
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    error={!!errors.dataFim}
                    helperText={errors.dataFim}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    label="Descrição"
                    fullWidth
                    multiline
                    minRows={3}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
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
                </Grid>
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
                  onClick={handleAddProduto}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Adicionar produto
                </Button>
              </Stack>

              {produtos.length > 0 && (
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selecaoUnicaProduto}
                        onChange={(e) =>
                          setSelecaoUnicaProduto(e.target.checked)
                        }
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
                          {selecaoUnicaProduto
                            ? "O participante será obrigado a selecionar um produto ao se inscrever"
                            : "O participante poderá se inscrever sem selecionar um produto"}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2, ml: 0 }}
                  />

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    {produtos.map((produto, index) => (
                      <Card
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "#FAFAFA",
                          position: "relative",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveProduto(index)}
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
                          <Grid size={{ xs: 12, md: 5 }}>
                            <TextField
                              label="Nome *"
                              fullWidth
                              size="small"
                              value={produto.nome}
                              onChange={(e) =>
                                handleProdutoChange(
                                  index,
                                  "nome",
                                  e.target.value
                                )
                              }
                              error={!!errors[`produto_${index}_nome`]}
                              helperText={errors[`produto_${index}_nome`]}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1.5,
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <RichTextEditor
                              label="Descrição"
                              value={produto.descricao}
                              onChange={(value) =>
                                handleProdutoChange(
                                  index,
                                  "descricao",
                                  value
                                )
                              }
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                              label="Valor *"
                              fullWidth
                              size="small"
                              type="number"
                              value={produto.valor}
                              onChange={(e) =>
                                handleProdutoChange(
                                  index,
                                  "valor",
                                  e.target.value
                                )
                              }
                              error={!!errors[`produto_${index}_valor`]}
                              helperText={errors[`produto_${index}_valor`]}
                              slotProps={{
                                input: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      R$
                                    </InputAdornment>
                                  ),
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1.5,
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {produtos.length === 0 && (
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
                disabled={isLoading}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  bgcolor: "#5B5FED",
                  "&:hover": { bgcolor: "#4A4EDC" },
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
