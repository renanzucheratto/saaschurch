'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventoFormSchema, EventoFormSchema } from '../schemas/evento-form.schema';

export const useEventoForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<EventoFormSchema>({
    resolver: zodResolver(eventoFormSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      aceitarTermo: false,
    },
  });

  const onSubmit = async (data: EventoFormSchema) => {
    try {
      console.log('Dados do formulário:', data);
      
      alert('Formulário enviado com sucesso!');
      reset();
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    isValid,
  };
};
