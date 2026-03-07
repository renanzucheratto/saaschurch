'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventoFormSchema, EventoFormSchema } from '../schemas/evento-form.schema';
import { useCadastrarParticipanteMutation } from '@/config/redux';

interface Alert {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export const useEventoForm = (eventoId: string) => {
  const [cadastrarParticipante, { isLoading: isSubmittingApi }] = useCadastrarParticipanteMutation();
  const [alert, setAlert] = useState<Alert>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<EventoFormSchema>({
    resolver: zodResolver(eventoFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      produtoId: '',
      termo_assinado: false,
    },
  });

  const onSubmit = async (data: EventoFormSchema) => {
    try {
      const payload = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        termo_assinado: data.termo_assinado,
        produtos_selecionados: [
          {
            produtoId: data.produtoId,
          },
        ],
      };

      await cadastrarParticipante({ eventId: eventoId, data: payload }).unwrap();
      
      setAlert({
        open: true,
        message: 'Cadastro realizado com sucesso!',
        severity: 'success',
      });
      reset({
        nome: '',
        telefone: '',
        email: '',
        produtoId: '',
        termo_assinado: false,
      }, {
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
  };
};
