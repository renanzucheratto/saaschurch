'use client';

import { Box } from '@mui/material';
import { Payment } from '@mercadopago/sdk-react';
import { usePaymentBrick } from './hooks/use-payment-brick';
import { useStyles } from './styles';
import type { PaymentBrickProps } from '../../types';

export function PaymentBrick(props: PaymentBrickProps) {
  const styles = useStyles();
  const { amount, onSubmitBrick } = usePaymentBrick(props);

  return (
    <Box sx={styles.container}>
      <Payment
        initialization={{ amount }}
        customization={{
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            bankTransfer: 'all',
          },
        }}
        onSubmit={onSubmitBrick}
      />
    </Box>
  );
}
