"use client";

import { Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { Control, Controller } from "react-hook-form";
import { TipoCampoCustomizado } from "@/types/evento.types";

const MINIMO_OPCOES = 2;

interface OpcoesEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  index: number;
  tipo: TipoCampoCustomizado;
  erro?: string;
}

// Marcador visual que espelha o tipo do campo: bolinha (radio), quadrado (checkbox) ou número (select).
const Marcador = ({ tipo, posicao }: { tipo: TipoCampoCustomizado; posicao: number }) => {
  if (tipo === "select") {
    return (
      <Typography
        variant="caption"
        sx={{ minWidth: 18, color: "#999", textAlign: "right", fontVariantNumeric: "tabular-nums" }}
      >
        {posicao}.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: 16,
        height: 16,
        flex: "none",
        border: "2px solid #c9c2e3",
        borderRadius: tipo === "radio" ? "50%" : 0.75,
      }}
    />
  );
};

export const OpcoesEditor = ({ control, index, tipo, erro }: OpcoesEditorProps) => (
  <Controller
    name={`campos_customizados.${index}.opcoes`}
    control={control}
    render={({ field }) => {
      const opcoes: string[] = Array.isArray(field.value) ? field.value : [];
      const podeRemover = opcoes.length > MINIMO_OPCOES;

      const alterar = (posicao: number, valor: string) => {
        const proximas = [...opcoes];
        proximas[posicao] = valor;
        field.onChange(proximas);
      };

      const adicionar = () => field.onChange([...opcoes, ""]);

      const remover = (posicao: number) =>
        field.onChange(opcoes.filter((_, i) => i !== posicao));

      return (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed #e2ddf3" }}>
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 1, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            Opções
          </Typography>

          <Stack spacing={0.75}>
            {opcoes.map((opcao, posicao) => (
              <Stack key={posicao} direction="row" alignItems="center" spacing={1}>
                <Marcador tipo={tipo} posicao={posicao + 1} />
                <TextField
                  value={opcao}
                  onChange={(e) => alterar(posicao, e.target.value)}
                  onBlur={field.onBlur}
                  placeholder={`Opção ${posicao + 1}`}
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: "white" } }}
                />
                <Tooltip
                  title={podeRemover ? "Remover opção" : `Mínimo de ${MINIMO_OPCOES} opções`}
                  placement="left"
                >
                  <span>
                    <IconButton
                      size="small"
                      disabled={!podeRemover}
                      onClick={() => remover(posicao)}
                      sx={{ p: 0.5, color: "#999", "&:hover": { color: "#d32f2f" } }}
                    >
                      <IconifyIcon icon="material-symbols:close" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}
          </Stack>

          <Button
            size="small"
            onClick={adicionar}
            startIcon={<IconifyIcon icon="material-symbols:add" width={16} />}
            sx={{ mt: 0.5, textTransform: "none", fontWeight: 600 }}
          >
            Adicionar opção
          </Button>

          {erro && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
              {erro}
            </Typography>
          )}
        </Box>
      );
    }}
  />
);
