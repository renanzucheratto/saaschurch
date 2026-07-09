'use client';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
} from '@mui/material';
import { AVISO_TROCA_PARA_GRATUITO, AVISO_TROCA_PARA_PAGO } from '../../helpers/constants';
import { useDialogoTrocarPlano } from './hooks/use-dialogo-trocar-plano';
import { useStyles } from './styles';
import type { DialogoTrocarPlanoProps } from '../../types';

export function DialogoTrocarPlano(props: DialogoTrocarPlanoProps) {
  const styles = useStyles();
  const {
    form,
    vaiCancelarAssinatura,
    vaiExigirAssinatura,
    confirmouCancelamento,
    setConfirmouCancelamento,
    bloqueiaSubmit,
    onSubmit,
  } = useDialogoTrocarPlano(props);

  const { aberto, instituicao, planos, enviando, onFechar } = props;
  const { errors } = form.formState;

  return (
    <Dialog open={aberto} onClose={onFechar} fullWidth maxWidth="sm">
      <DialogTitle>Trocar plano — {instituicao?.nome}</DialogTitle>

      <DialogContent>
        <Box sx={styles.conteudo}>
          <TextField
            select
            fullWidth
            label="Plano de destino"
            error={Boolean(errors.planoCodigo)}
            helperText={errors.planoCodigo?.message}
            {...form.register('planoCodigo')}
          >
            {planos.map((plano) => (
              <MenuItem key={plano.codigo} value={plano.codigo}>
                {plano.nome}
              </MenuItem>
            ))}
          </TextField>

          {vaiExigirAssinatura && <Alert severity="info">{AVISO_TROCA_PARA_PAGO}</Alert>}

          {vaiCancelarAssinatura && (
            <>
              <Alert severity="warning">{AVISO_TROCA_PARA_GRATUITO}</Alert>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={confirmouCancelamento}
                    onChange={(evento) => setConfirmouCancelamento(evento.target.checked)}
                  />
                }
                label="Entendo que a assinatura ativa será cancelada"
              />
            </>
          )}

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Motivo"
            error={Boolean(errors.motivo)}
            helperText={errors.motivo?.message}
            {...form.register('motivo')}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onFechar}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit} disabled={enviando || bloqueiaSubmit}>
          Confirmar troca
        </Button>
      </DialogActions>
    </Dialog>
  );
}
