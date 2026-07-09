'use client';

import { Alert, Box, Button, Typography } from '@mui/material';
import { usePixQrCode } from './hooks/use-pix-qr-code';
import { useStyles } from './styles';
import type { PixQrCodeProps } from '../../types';

export function PixQrCode(props: PixQrCodeProps) {
  const styles = useStyles();
  const { restante, copiado, copiar, imagem } = usePixQrCode(props);

  if (props.expirado) {
    return <Alert severity="warning">O código PIX expirou. Gere um novo pagamento.</Alert>;
  }

  return (
    <Box sx={styles.container}>
      <Typography variant="h6">Pague com PIX</Typography>

      {imagem && <Box component="img" src={imagem} alt="QR Code do PIX" sx={styles.qr} />}

      <Typography sx={styles.contador}>Expira em {restante}</Typography>

      <Typography sx={styles.codigo}>{props.pix.qrCode}</Typography>

      <Button variant="outlined" onClick={copiar}>
        {copiado ? 'Código copiado!' : 'Copiar código'}
      </Button>

      <Typography variant="body2" color="text.secondary">
        Assim que o pagamento for confirmado, esta tela é atualizada automaticamente.
      </Typography>
    </Box>
  );
}
