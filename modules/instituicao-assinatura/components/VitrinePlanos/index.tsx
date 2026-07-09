'use client';

import { Box, Chip, Typography } from '@mui/material';
import { useVitrinePlanos } from './hooks/use-vitrine-planos';
import { useStyles } from './styles';
import type { VitrinePlanosProps } from '../../types';

export function VitrinePlanos(props: VitrinePlanosProps) {
  const styles = useStyles();
  const { cartoes } = useVitrinePlanos(props);

  return (
    <Box sx={styles.grade}>
      {cartoes.map((cartao) => (
        <Box key={cartao.codigo} sx={styles.cartao(cartao.atual)}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {cartao.nome}
            </Typography>
            {cartao.atual && <Chip label="Plano atual" size="small" color="primary" />}
          </Box>

          <Typography sx={styles.preco}>{cartao.preco}</Typography>

          {cartao.descricao && <Typography sx={styles.detalhe}>{cartao.descricao}</Typography>}

          <Typography sx={styles.detalhe}>{cartao.fee}</Typography>
          <Typography sx={styles.detalhe}>Eventos ativos: {cartao.eventos}</Typography>
          <Typography sx={styles.detalhe}>Usuários: {cartao.usuarios}</Typography>
        </Box>
      ))}
    </Box>
  );
}
