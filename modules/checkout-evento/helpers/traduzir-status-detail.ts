const MENSAGENS: Record<string, string> = {
  accredited: 'Pagamento aprovado.',
  pending_contingency: 'Estamos processando seu pagamento. Isso pode levar alguns minutos.',
  pending_review_manual: 'Seu pagamento está em análise.',
  pending_waiting_transfer: 'Aguardando a confirmação do PIX.',
  pending_waiting_payment: 'Aguardando o pagamento.',
  cc_rejected_insufficient_amount: 'O cartão não tem saldo ou limite suficiente.',
  cc_rejected_bad_filled_card_number: 'O número do cartão está incorreto.',
  cc_rejected_bad_filled_date: 'A data de validade do cartão está incorreta.',
  cc_rejected_bad_filled_security_code: 'O código de segurança está incorreto.',
  cc_rejected_bad_filled_other: 'Confira os dados do cartão e tente novamente.',
  cc_rejected_call_for_authorize: 'Autorize o pagamento com o banco emissor do cartão.',
  cc_rejected_card_disabled: 'O cartão está desabilitado. Fale com o banco emissor.',
  cc_rejected_duplicated_payment: 'Você já fez um pagamento desse valor.',
  cc_rejected_high_risk: 'O pagamento foi recusado por segurança. Use outro meio de pagamento.',
  cc_rejected_max_attempts: 'Limite de tentativas atingido. Use outro cartão.',
  cc_rejected_other_reason: 'O pagamento foi recusado pelo banco emissor.',
};

/** `statusDetail` desconhecido cai no fallback — o usuário nunca vê o código bruto. */
export const traduzirStatusDetail = (statusDetail: string | null): string =>
  (statusDetail && MENSAGENS[statusDetail]) ||
  'Não foi possível concluir o pagamento. Tente novamente ou use outro meio de pagamento.';
