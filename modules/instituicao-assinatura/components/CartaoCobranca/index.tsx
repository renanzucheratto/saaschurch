'use client';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { formatarMoeda } from '@/config/helpers/formatar-moeda';
import { useCartaoCobranca } from './hooks/use-cartao-cobranca';
import { useStyles } from './styles';
import type { CartaoCobrancaProps } from '../../types';

export function CartaoCobranca(props: CartaoCobrancaProps) {
  const styles = useStyles();
  const {
    rotuloStatus,
    severidade,
    pendente,
    ativa,
    dialogoAberto,
    motivo,
    motivoValido,
    abrirDialogo,
    fecharDialogo,
    onMotivoChange,
    confirmar,
  } = useCartaoCobranca(props);

  const { assinatura, podeCancelar, cancelando } = props;

  return (
    <Box sx={styles.cartao}>
      <Typography variant="h6">Cobrança</Typography>

      <Alert severity={severidade}>Assinatura {rotuloStatus.toLowerCase()}.</Alert>

      <Box sx={styles.linhaDados}>
        <Box>
          <Typography sx={styles.rotulo}>Valor</Typography>
          <Typography sx={styles.valor}>{formatarMoeda(assinatura.valor)}</Typography>
        </Box>
        <Box>
          <Typography sx={styles.rotulo}>Periodicidade</Typography>
          <Typography sx={styles.valor}>{assinatura.periodicidade}</Typography>
        </Box>
        <Box>
          <Typography sx={styles.rotulo}>Próxima cobrança</Typography>
          <Typography sx={styles.valor}>
            {assinatura.proximaCobranca
              ? new Date(assinatura.proximaCobranca).toLocaleDateString('pt-BR')
              : '—'}
          </Typography>
        </Box>
      </Box>

      <Box sx={styles.acoes}>
        {pendente && assinatura.initPoint && (
          <Button variant="contained" href={assinatura.initPoint} target="_blank" rel="noopener">
            Finalizar assinatura
          </Button>
        )}

        {ativa && podeCancelar && (
          <Button color="error" variant="outlined" onClick={abrirDialogo} disabled={cancelando}>
            Cancelar assinatura
          </Button>
        )}
      </Box>

      <Dialog open={dialogoAberto} onClose={fecharDialogo} fullWidth maxWidth="sm">
        <DialogTitle>Cancelar assinatura</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A assinatura será cancelada no Mercado Pago e a instituição deixará de ser
            cobrada. Descreva o motivo para o registro de auditoria.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            margin="dense"
            label="Motivo"
            value={motivo}
            onChange={(evento) => onMotivoChange(evento.target.value)}
            error={motivo.length > 0 && !motivoValido}
            helperText="Descreva o motivo com pelo menos 10 caracteres"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialogo}>Voltar</Button>
          <Button color="error" onClick={confirmar} disabled={!motivoValido || cancelando}>
            Confirmar cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
