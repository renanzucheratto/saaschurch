"use client";

import type { ReactNode } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { CardWithTitle } from "@/components/card-with-title";
import { useProjetosStyles } from "../styles";

interface Props {
  label: string;
  valor: string;
  descricao?: string;
  icone: string;
  cor: string;
  fundo: string;
  isLoading: boolean;
  children?: ReactNode;
}

export const BigNumberCard = ({
  label,
  valor,
  descricao,
  icone,
  cor,
  fundo,
  isLoading,
  children,
}: Props) => {
  const styles = useProjetosStyles();

  return (
    <CardWithTitle title={label}>
      <Box sx={styles.bigNumberConteudo}>
        <Box sx={styles.bigNumberIcone(cor, fundo)}>
          <IconifyIcon icon={icone} width={18} height={18} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          {isLoading ? (
            <Skeleton width={120} height={36} />
          ) : (
            <Typography variant="h4" color="text.primary" sx={styles.bigNumberValor}>
              {valor}
            </Typography>
          )}
          {descricao && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {descricao}
            </Typography>
          )}
        </Box>
      </Box>
      {children && <Box sx={styles.graficoContainer}>{children}</Box>}
    </CardWithTitle>
  );
};
