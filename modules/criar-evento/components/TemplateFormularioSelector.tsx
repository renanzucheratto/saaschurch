"use client";

import { Box, Stack, Typography } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { CardWithTitle } from "@/components/card-with-title";
import { TemplateFormulario } from "@/types/evento.types";

interface TemplateFormularioSelectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // 'coluna-estreita': empilha as opções no desktop (card lateral).
  // 'largura-total': mantém as opções lado a lado (bloco de largura cheia).
  layout?: "coluna-estreita" | "largura-total";
}

interface OpcaoTemplate {
  valor: TemplateFormulario;
  nome: string;
  descricao: string;
  // Cada item representa uma linha do diagrama: true ocupa a largura inteira.
  diagrama: boolean[];
  colunas: number;
}

const TEMPLATE_PADRAO: TemplateFormulario = "padrao";

const OPCOES: OpcaoTemplate[] = [
  {
    valor: "padrao",
    nome: "Padrão",
    descricao: "Dois campos por linha",
    diagrama: [false, false, false, false, true],
    colunas: 2,
  },
  {
    valor: "empilhado",
    nome: "Empilhado",
    descricao: "Um campo embaixo do outro",
    diagrama: [true, true, true, true],
    colunas: 1,
  },
];

const Diagrama = ({ opcao }: { opcao: OpcaoTemplate }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: `repeat(${opcao.colunas}, 1fr)`,
      gap: 0.75,
      mb: 1,
    }}
  >
    {opcao.diagrama.map((larguraTotal, i) => (
      <Box
        key={i}
        sx={{
          height: 16,
          borderRadius: 0.5,
          bgcolor: "#ded7f6",
          gridColumn: larguraTotal ? "1 / -1" : "auto",
        }}
      />
    ))}
  </Box>
);

export const TemplateFormularioSelector = ({
  control,
  layout = "coluna-estreita",
}: TemplateFormularioSelectorProps) => (
  <CardWithTitle
    title={
      <>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Template do formulário
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Como os campos se organizam na página de inscrição
        </Typography>
      </>
    }
  >
    <Controller
      name="template_formulario"
      control={control}
      defaultValue={TEMPLATE_PADRAO}
      render={({ field }) => (
        <Stack
          direction={
            layout === "largura-total"
              ? { xs: "column", sm: "row" }
              : { xs: "column", sm: "row", md: "column" }
          }
          spacing={1.5}
        >
          {OPCOES.map((opcao) => {
            // Sem valor no form (evento antigo, por exemplo), o template padrão é o selecionado.
            const selecionado = (field.value ?? TEMPLATE_PADRAO) === opcao.valor;

            return (
              <Box
                key={opcao.valor}
                role="radio"
                aria-checked={selecionado}
                tabIndex={0}
                onClick={() => field.onChange(opcao.valor)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    field.onChange(opcao.valor);
                  }
                }}
                sx={{
                  flex: 1,
                  p: 1.5,
                  cursor: "pointer",
                  borderRadius: 1.5,
                  border: "2px solid",
                  borderColor: selecionado ? "primary.main" : "grey.200",
                  bgcolor: selecionado ? "#f2eefc" : "background.paper",
                  transition: "border-color .15s, background-color .15s",
                  "&:hover": { borderColor: selecionado ? "primary.main" : "grey.300" },
                }}
              >
                <Diagrama opcao={opcao} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {opcao.nome}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {opcao.descricao}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}
    />
  </CardWithTitle>
);
