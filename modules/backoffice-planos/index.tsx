'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { InitPointCopiavel } from './components/InitPointCopiavel';
import { DialogoTrocarPlano } from './components/DialogoTrocarPlano';
import { COR_ASSINATURA, ROTULO_ASSINATURA } from './helpers/constants';
import { useBackofficePlanos } from './hooks/use-backoffice-planos';
import { useStyles } from './styles';

export function BackofficePlanos() {
  const styles = useStyles();
  const {
    instituicoes,
    planos,
    emEdicao,
    initPoint,
    erro,
    trocando,
    carregando,
    abrirDialogo,
    fecharDialogo,
    fecharInitPoint,
    onConfirmar,
    onAlternarPiloto,
  } = useBackofficePlanos();

  if (carregando) {
    return <Skeleton variant="rounded" height={400} sx={styles.skeleton} />;
  }

  return (
    <Box sx={styles.container}>
      <Typography variant="h5">Planos das igrejas</Typography>

      {erro && <Alert severity="error">{erro}</Alert>}

      {initPoint && (
        <Alert severity="info" onClose={fecharInitPoint}>
          <Typography gutterBottom>
            Envie este link para a igreja autorizar a assinatura. A troca de plano só
            vigora depois disso.
          </Typography>
          <InitPointCopiavel initPoint={initPoint} />
        </Alert>
      )}

      <Box sx={styles.tabela}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Instituição</TableCell>
              <TableCell>Plano</TableCell>
              <TableCell>Assinatura</TableCell>
              <TableCell align="center">Parceiro piloto</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {instituicoes.map((instituicao) => (
              <TableRow key={instituicao.id}>
                <TableCell>{instituicao.nome}</TableCell>

                <TableCell>
                  <Box sx={styles.celulaBadges}>
                    <Chip label={instituicao.plano?.nome ?? 'Plano padrão'} size="small" />
                    {instituicao.plano?.cobrancaSaaS === false && (
                      <Chip label="Gratuito" size="small" color="success" />
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  {instituicao.assinaturaStatus ? (
                    <Chip
                      label={ROTULO_ASSINATURA[instituicao.assinaturaStatus]}
                      color={COR_ASSINATURA[instituicao.assinaturaStatus]}
                      size="small"
                    />
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell align="center">
                  <Switch
                    checked={instituicao.parceiroPiloto}
                    onChange={() => onAlternarPiloto(instituicao)}
                  />
                </TableCell>

                <TableCell align="right">
                  <Button size="small" onClick={() => abrirDialogo(instituicao)}>
                    Trocar plano
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <DialogoTrocarPlano
        aberto={Boolean(emEdicao)}
        instituicao={emEdicao}
        planos={planos}
        enviando={trocando}
        onFechar={fecharDialogo}
        onConfirmar={onConfirmar}
      />
    </Box>
  );
}
