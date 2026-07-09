'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildEventoFormSchema, EventoFormValues } from '../schemas/evento-form.schema';
import { useCadastrarParticipanteMutation } from '@/config/redux';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { CampoCustomizado, Produto } from '@/types/evento.types';

interface Alert {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

/** Etapa de pagamento aberta depois da inscrição, quando o produto escolhido é cobrável. */
interface Checkout {
  participanteId: string;
  produtoIds: string[];
}

export const useEventoForm = (
  eventoId: string,
  hasProdutos: boolean = false,
  selecaoUnicaProduto: boolean = true,
  canSubmit: boolean = true,
  campos: CampoCustomizado[] = [],
  produtos: Produto[] = [],
) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [cadastrarParticipante, { isLoading: isSubmittingApi }] = useCadastrarParticipanteMutation();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [alert, setAlert] = useState<Alert>({
    open: false,
    message: '',
    severity: 'success',
  });

  const temCamposCustomizados = campos.length > 0;
  const camposVisiveis = campos.filter((c) => !c.oculto);

  const defaultRespostas: Record<string, string | string[] | boolean> = {};
  for (const campo of camposVisiveis) {
    if (campo.tipo === 'checkbox') {
      defaultRespostas[campo.id] = [];
    } else if (campo.tipo === 'aceite_termo') {
      defaultRespostas[campo.id] = false;
    } else {
      defaultRespostas[campo.id] = '';
    }
  }

  const buildDefaultValues = (): EventoFormValues => ({
    nome: '',
    telefone: '',
    email: '',
    rg: '',
    cpf: '',
    produtoId: '',
    termo_assinado: false,
    hasProdutos,
    selecaoUnicaProduto,
    respostas_customizadas: defaultRespostas,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<EventoFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(buildEventoFormSchema(campos) as any),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: buildDefaultValues(),
  });

  useEffect(() => {
    setValue('hasProdutos', hasProdutos);
    setValue('selecaoUnicaProduto', selecaoUnicaProduto);
  }, [hasProdutos, selecaoUnicaProduto, setValue]);

  // Os campos customizados chegam de forma assíncrona (evento carregado depois do mount).
  // Quando a lista de campos muda, reinicializa o form para aplicar o schema/defaults corretos.
  const camposSignature = campos.map((c) => `${c.id}:${c.oculto ? 1 : 0}`).join(',');
  useEffect(() => {
    reset(buildDefaultValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camposSignature]);

  const onSubmit = async (data: EventoFormValues) => {
    try {
      if (!canSubmit) {
        setAlert({
          open: true,
          message: 'Este evento está indisponível para novas inscrições.',
          severity: 'error',
        });
        return;
      }

      if (!executeRecaptcha) {
        setAlert({
          open: true,
          message: 'reCAPTCHA não está disponível. Tente novamente.',
          severity: 'error',
        });
        return;
      }

      const recaptchaToken = await executeRecaptcha('submit_form');

      const produtosSelecionados = data.produtoId ? [{ produtoId: data.produtoId }] : [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let payload: Record<string, any>;

      if (temCamposCustomizados) {
        const respostas = camposVisiveis
          .map((campo) => {
            const valor = data.respostas_customizadas?.[campo.id];
            if (campo.tipo === 'checkbox') {
              return { campoId: campo.id, valores: Array.isArray(valor) ? valor : [] };
            }
            if (campo.tipo === 'aceite_termo') {
              return { campoId: campo.id, valor: valor === true ? 'true' : '' };
            }
            if (campo.tipo === 'cpf' || campo.tipo === 'rg' || campo.tipo === 'telefone') {
              const raw = typeof valor === 'string' ? valor.replace(/\D/g, '') : '';
              return { campoId: campo.id, valor: raw };
            }
            if (campo.tipo === 'email') {
              const raw = typeof valor === 'string' ? valor.trim().toLowerCase() : '';
              return { campoId: campo.id, valor: raw };
            }
            return { campoId: campo.id, valor: typeof valor === 'string' ? valor : '' };
          })
          .filter((r) => {
            if ('valores' in r) return (r.valores as string[]).length > 0;
            return r.valor !== undefined && r.valor !== '';
          });

        payload = {
          recaptchaToken,
          produtos_selecionados: produtosSelecionados,
          respostas_customizadas: respostas,
        };
      } else {
        payload = {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          rg: data.rg,
          cpf: data.cpf,
          termo_assinado: data.termo_assinado,
          recaptchaToken,
          produtos_selecionados: produtosSelecionados,
        };
      }

      const participante = await cadastrarParticipante({ eventId: eventoId, data: payload as Parameters<typeof cadastrarParticipante>[0]['data'] }).unwrap();

      // Evento sem produto cobrável conclui aqui: o checkout nem é montado, e
      // `GET /pagamentos/checkout-config` nem chega a ser chamado.
      const produtoEscolhido = produtos.find((produto) => produto.id === data.produtoId);

      if (produtoEscolhido?.exigePagamento && participante?.id) {
        setCheckout({ participanteId: participante.id, produtoIds: [produtoEscolhido.id] });
        return;
      }

      setAlert({
        open: true,
        message: 'Cadastro realizado com sucesso!',
        severity: 'success',
      });
      reset(buildDefaultValues(), {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);

      const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Erro ao enviar formulário. Tente novamente.';

      setAlert({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isSubmitting || isSubmittingApi,
    isValid,
    alert,
    handleCloseAlert,
    checkout,
  };
};
