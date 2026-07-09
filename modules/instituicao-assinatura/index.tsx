'use client';

import { Alert, Box, Skeleton, Typography } from '@mui/material';
import { PlanoBadge } from '@/components/PlanoBadge';
import { CartaoCobranca } from './components/CartaoCobranca';
import { VitrinePlanos } from './components/VitrinePlanos';
import { useInstituicaoAssinatura } from './hooks/use-instituicao-assinatura';
import { useStyles } from './styles';

export function InstituicaoAssinatura() {
  const styles = useStyles();
  const {
    plano,
    metricas,
    parceiroPiloto,
    assinatura,
    exibirCobranca,
    planos,
    podeCancelar,
    cancelando,
    onCancelar,
    carregando,
    erro,
  } = useInstituicaoAssinatura();

  if (carregando) {
    return <Skeleton variant="rounded" height={320} sx={styles.skeleton} />;
  }

  if (erro || !plano) {
    return <Alert severity="error">Não foi possível carregar o plano da sua instituição.</Alert>;
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.cabecalho}>
        <Typography variant="h5">Plano e assinatura</Typography>
        <PlanoBadge plano={plano} parceiroPiloto={parceiroPiloto} />
      </Box>

      <Box sx={styles.cartao}>
        <Typography variant="h6">{plano.nome}</Typography>
        {plano.descricao && <Typography color="text.secondary">{plano.descricao}</Typography>}

        <Box sx={styles.gradeMetricas}>
          {metricas.map((metrica) => (
            <Box key={metrica.rotulo} sx={styles.metrica}>
              <Typography sx={styles.rotuloMetrica}>{metrica.rotulo}</Typography>
              <Typography sx={styles.valorMetrica}>{metrica.valor}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {exibirCobranca && assinatura && (
        <CartaoCobranca
          assinatura={assinatura}
          podeCancelar={podeCancelar}
          cancelando={cancelando}
          onCancelar={onCancelar}
        />
      )}

      <Box>
        <Typography variant="h6" gutterBottom>
          Planos disponíveis
        </Typography>
        <VitrinePlanos planos={planos} codigoPlanoAtual={plano.codigo} />
      </Box>
    </Box>
  );
}
