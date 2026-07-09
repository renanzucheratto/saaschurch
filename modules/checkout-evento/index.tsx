'use client';

import dynamic from 'next/dynamic';
import { Alert, Box, Skeleton, Typography } from '@mui/material';
import { PixQrCode } from './components/PixQrCode';
import { ResultadoPagamento } from './components/ResultadoPagamento';
import { MENSAGEM_SEM_CONTA_MP } from './helpers/constants';
import { useCheckoutEvento } from './hooks/use-checkout-evento';
import { useStyles } from './styles';
import type { CheckoutEventoProps } from './types';

// O SDK do Mercado Pago toca `window` na importação: nunca pode rodar no servidor.
const PaymentBrick = dynamic(
  () => import('./components/PaymentBrick').then((modulo) => modulo.PaymentBrick),
  { ssr: false, loading: () => <Skeleton variant="rounded" height={420} /> },
);

export function CheckoutEvento(props: CheckoutEventoProps) {
  const styles = useStyles();
  const {
    publicKey,
    valorTotal,
    valorFormatado,
    carregando,
    semContaMp,
    featureIndisponivel,
    erro,
    enviando,
    pix,
    status,
    statusDetail,
    finalizado,
    expirado,
    onSubmit,
    tentarNovamente,
  } = useCheckoutEvento(props);

  if (carregando) {
    return <Skeleton variant="rounded" height={420} sx={styles.skeleton} />;
  }

  if (semContaMp || featureIndisponivel) {
    return <Alert severity="info">{MENSAGEM_SEM_CONTA_MP}</Alert>;
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.cabecalho}>
        <Typography variant="h5">Pagamento</Typography>
        <Typography sx={styles.total}>{valorFormatado}</Typography>
      </Box>

      {erro && <Alert severity="error">{erro}</Alert>}

      {finalizado && status ? (
        <ResultadoPagamento
          status={status}
          statusDetail={statusDetail}
          onTentarNovamente={tentarNovamente}
        />
      ) : pix ? (
        <PixQrCode pix={pix} expirado={expirado} />
      ) : (
        publicKey && (
          // `key={publicKey}`: `initMercadoPago` não recarrega com outra chave, então
          // uma chave nova precisa remontar o Brick do zero.
          <PaymentBrick
            key={publicKey}
            publicKey={publicKey}
            valor={valorTotal}
            enviando={enviando}
            onSubmit={onSubmit}
          />
        )
      )}
    </Box>
  );
}
