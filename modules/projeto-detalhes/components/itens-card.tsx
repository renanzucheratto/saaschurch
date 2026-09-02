"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { CardWithTitle } from "@/components/card-with-title";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import type { ItemProjeto } from "@/types/projeto.types";
import { useProjetoDetalhesStyles } from "../styles";

interface Props {
  itens: ItemProjeto[];
  valorTotal: number;
}

export const ItensCard = ({ itens, valorTotal }: Props) => {
  const styles = useProjetoDetalhesStyles();

  return (
    <CardWithTitle
      title={
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Itens do projeto
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Orçamento planejado e aprovado para reembolso
          </Typography>
        </>
      }
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={styles.cabecalhoTabela}>Item</TableCell>
              <TableCell sx={styles.cabecalhoTabela}>Descrição</TableCell>
              <TableCell align="center" sx={styles.cabecalhoTabela}>
                Qtd.
              </TableCell>
              <TableCell align="right" sx={styles.cabecalhoTabela}>
                Valor unit.
              </TableCell>
              <TableCell align="right" sx={styles.cabecalhoTabela}>
                Subtotal
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nome}</TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{item.descricao || "-"}</TableCell>
                <TableCell align="center">{item.quantidade}</TableCell>
                <TableCell align="right">
                  {formatNumberToCurrency(Number(item.valor_unit))}
                </TableCell>
                <TableCell align="right">
                  {formatNumberToCurrency(Number(item.valor_unit) * item.quantidade)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} align="right" sx={styles.linhaTotal}>
                Total planejado
              </TableCell>
              <TableCell align="right" sx={styles.linhaTotal}>
                {formatNumberToCurrency(valorTotal)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </CardWithTitle>
  );
};
