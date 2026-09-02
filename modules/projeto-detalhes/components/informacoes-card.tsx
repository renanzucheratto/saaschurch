"use client";

import { Divider, Grid, Typography } from "@mui/material";
import { CardWithTitle } from "@/components/card-with-title";
import { formatDate } from "@/config/helpers/format-date";
import { formatNumberToCurrency } from "@/config/helpers/currency-mask";
import type { ProjetoDetalhes } from "@/types/projeto.types";
import { useProjetoDetalhesStyles } from "../styles";

interface Props {
  projeto: ProjetoDetalhes;
}

interface InfoProps {
  label: string;
  valor: string;
}

const Info = ({ label, valor }: InfoProps) => {
  const styles = useProjetoDetalhesStyles();

  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Typography variant="caption" color="text.secondary" sx={styles.infoLabel}>
        {label}
      </Typography>
      <Typography variant="body2" sx={styles.infoValor}>
        {valor}
      </Typography>
    </Grid>
  );
};

export const InformacoesCard = ({ projeto }: Props) => {
  const styles = useProjetoDetalhesStyles();

  return (
    <CardWithTitle title="Informações do projeto">
      <Grid container spacing={2}>
        <Info label="Líder" valor={projeto.lider?.nome || "-"} />
        <Info label="Valor planejado" valor={formatNumberToCurrency(projeto.valor_total)} />
        <Info label="Início" valor={formatDate(projeto.data_inicio)} />
        <Info label="Término" valor={formatDate(projeto.data_fim)} />
      </Grid>

      {projeto.descricao && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={styles.infoLabel}>
            Descrição
          </Typography>
          <Typography variant="body2">{projeto.descricao}</Typography>
        </>
      )}

      {projeto.status?.justificativa && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" sx={styles.infoLabel}>
            Justificativa do status
          </Typography>
          <Typography variant="body2">{projeto.status.justificativa}</Typography>
        </>
      )}
    </CardWithTitle>
  );
};
