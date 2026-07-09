'use client';

import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import { DialogoDesconectar } from './components/DialogoDesconectar';
import { useInstituicaoPagamentos } from './hooks/use-instituicao-pagamentos';
import { useStyles } from './styles';

export function InstituicaoPagamentos() {
  const styles = useStyles();
  const {
    conexao,
    estado,
    sucesso,
    erroOauth,
    eventosAtivos,
    dialogoAberto,
    conectando,
    desconectando,
    carregando,
    onCta,
    fecharDialogo,
    onConfirmarDesconexao,
  } = useInstituicaoPagamentos();

  // Skeleton em vez do estado NAO_CONECTADO: uma igreja conectada não pode ver
  // "conecte sua conta" piscar antes do status chegar.
  if (carregando) {
    return <Skeleton variant="rounded" height={260} sx={styles.skeleton} />;
  }

  return (
    <Box sx={styles.container}>
      <Typography variant="h5">Pagamentos</Typography>

      {sucesso && <Alert severity="success">Conta do Mercado Pago conectada com sucesso.</Alert>}
      {erroOauth && <Alert severity="error">{erroOauth}</Alert>}

      <Box sx={styles.cartao}>
        <Alert severity={estado.severidade}>{estado.mensagem}</Alert>

        {conexao?.status === 'ACTIVE' && (
          <Box sx={styles.dados}>
            <Box>
              <Typography sx={styles.rotulo}>Conta Mercado Pago</Typography>
              <Typography>{conexao.mpUserId}</Typography>
            </Box>
            <Box>
              <Typography sx={styles.rotulo}>Conectada em</Typography>
              <Typography>
                {conexao.conectadoEm
                  ? new Date(conexao.conectadoEm).toLocaleDateString('pt-BR')
                  : '—'}
              </Typography>
            </Box>
          </Box>
        )}

        <Box>
          <Button
            variant={estado.conectado ? 'outlined' : 'contained'}
            color={estado.conectado ? 'error' : 'primary'}
            onClick={onCta}
            disabled={conectando || desconectando}
          >
            {estado.cta}
          </Button>
        </Box>
      </Box>

      <DialogoDesconectar
        aberto={dialogoAberto}
        eventosAtivos={eventosAtivos}
        desconectando={desconectando}
        onFechar={fecharDialogo}
        onConfirmar={onConfirmarDesconexao}
      />
    </Box>
  );
}
