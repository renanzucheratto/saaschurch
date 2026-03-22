import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { IMaskInput } from 'react-imask';
import { userSchema, UserFormData } from '../schemas/user.schema';
import { useCriarUsuarioMutation } from '@/config/redux/api/usersApi';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const TextMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(00) 00000-0000"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => {
          onChange({ target: { name: props.name, value } });
        }}
        overwrite
      />
    );
  },
);

const CPFMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function CPFMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="000.000.000-00"
        definitions={{
          '0': /[0-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => {
          onChange({ target: { name: props.name, value } });
        }}
        overwrite
      />
    );
  },
);

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const [criarUsuario, { isLoading, error }] = useCriarUsuarioMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      rg: '',
      cpf: '',
      userType: 'membro',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await criarUsuario(data).unwrap();
      onSuccess();
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(error as any)?.data?.error || 'Erro ao criar usuário'}
        </Alert>
      )}

      <Stack gap={2}>
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nome Completo"
              fullWidth
              error={!!errors.nome}
              helperText={errors.nome?.message}
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />
          )}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Telefone"
                fullWidth
                error={!!errors.telefone}
                helperText={errors.telefone?.message}
                disabled={isLoading}
                InputProps={{
                  inputComponent: TextMaskCustom as any,
                }}
              />
            )}
          />

          <Controller
            name="userType"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tipo de Usuário"
                select
                fullWidth
                error={!!errors.userType}
                helperText={errors.userType?.message}
                disabled={isLoading}
              >
                <MenuItem value="membro">Membro</MenuItem>
                <MenuItem value="backoffice">Backoffice</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="rg"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="RG"
                fullWidth
                error={!!errors.rg}
                helperText={errors.rg?.message}
                disabled={isLoading}
              />
            )}
          />

          <Controller
            name="cpf"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="CPF"
                fullWidth
                error={!!errors.cpf}
                helperText={errors.cpf?.message}
                disabled={isLoading}
                InputProps={{
                  inputComponent: CPFMaskCustom as any,
                }}
              />
            )}
          />
        </Box>

        <Box sx={{ mt: '30px!important', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: '#6366f1',
              '&:hover': { backgroundColor: '#4f46e5' },
              px: 4
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Criar Usuário'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
