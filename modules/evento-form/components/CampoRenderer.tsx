'use client';

import { Control, Controller } from 'react-hook-form';
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
  FormHelperText,
  MenuItem,
} from '@mui/material';
import { CampoCustomizado } from '@/types/evento.types';
import { EventoFormValues } from '../schemas/evento-form.schema';
import { CPFMaskCustom, DataMaskCustom, RGMaskCustom, TelefoneMaskCustom } from './MaskInputs';

interface CampoRendererProps {
  campo: CampoCustomizado;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<EventoFormValues, any>;
  disabled?: boolean;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    bgcolor: '#fafafa',
    '&:hover': { bgcolor: '#f5f5f5' },
    '&.Mui-focused': { bgcolor: 'white' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.95rem' },
};

export const CampoRenderer = ({ campo, control, disabled }: CampoRendererProps) => {
  const label = `${campo.label}${campo.obrigatorio ? ' *' : ''}`;
  // O nome do campo é dinâmico (id do campo customizado), fora do tipo estático do form.
  const fieldName = `respostas_customizadas.${campo.id}` as never;
  const opcoes = campo.opcoes ?? [];

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message;

        if (campo.tipo === 'radio') {
          return (
            <FormControl error={!!fieldState.error} disabled={disabled} component="fieldset">
              <FormLabel component="legend" sx={{ fontSize: '0.95rem', mb: 0.5 }}>{label}</FormLabel>
              <RadioGroup
                value={(field.value as string) ?? ''}
                onChange={(_e, value) => field.onChange(value)}
              >
                {opcoes.map((opcao) => (
                  <FormControlLabel key={opcao} value={opcao} control={<Radio />} label={opcao} />
                ))}
              </RadioGroup>
              {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
            </FormControl>
          );
        }

        if (campo.tipo === 'select') {
          return (
            <TextField
              select
              label={label}
              fullWidth
              disabled={disabled}
              value={(field.value as string) ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              helperText={errorMessage}
              variant="outlined"
              sx={fieldSx}
            >
              {opcoes.map((opcao) => (
                <MenuItem key={opcao} value={opcao}>{opcao}</MenuItem>
              ))}
            </TextField>
          );
        }

        if (campo.tipo === 'checkbox') {
          const selecionados: string[] = Array.isArray(field.value) ? (field.value as string[]) : [];
          const toggle = (opcao: string) => {
            if (selecionados.includes(opcao)) {
              field.onChange(selecionados.filter((v) => v !== opcao));
            } else {
              field.onChange([...selecionados, opcao]);
            }
          };
          return (
            <FormControl error={!!fieldState.error} disabled={disabled} component="fieldset">
              <FormLabel component="legend" sx={{ fontSize: '0.95rem', mb: 0.5 }}>{label}</FormLabel>
              <FormGroup>
                {opcoes.map((opcao) => (
                  <FormControlLabel
                    key={opcao}
                    control={<Checkbox checked={selecionados.includes(opcao)} onChange={() => toggle(opcao)} />}
                    label={opcao}
                  />
                ))}
              </FormGroup>
              {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
            </FormControl>
          );
        }

        if (campo.tipo === 'aceite_termo') {
          const termoLabel = campo.textoTermo || campo.label;
          return (
            <FormControl error={!!fieldState.error} disabled={disabled} component="fieldset">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={campo.obrigatorio ? `${termoLabel} *` : termoLabel}
              />
              {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
            </FormControl>
          );
        }

        if (campo.tipo === 'email') {
          return (
            <TextField
              label={label}
              type="email"
              fullWidth
              disabled={disabled}
              value={(field.value as string) ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              helperText={errorMessage}
              variant="outlined"
              sx={fieldSx}
            />
          );
        }

        if (campo.tipo === 'telefone') {
          return (
            <TextField
              label={label}
              fullWidth
              disabled={disabled}
              value={(field.value as string) ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              helperText={errorMessage}
              variant="outlined"
              sx={fieldSx}
              placeholder="(00) 00000-0000"
              InputProps={{ inputComponent: TelefoneMaskCustom as never }}
            />
          );
        }

        if (campo.tipo === 'cpf') {
          return (
            <TextField
              label={label}
              fullWidth
              disabled={disabled}
              value={(field.value as string) ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              helperText={errorMessage}
              variant="outlined"
              sx={fieldSx}
              placeholder="000.000.000-00"
              InputProps={{ inputComponent: CPFMaskCustom as never }}
            />
          );
        }

        if (campo.tipo === 'data') {
          return (
            <TextField
              label={label}
              fullWidth
              disabled={disabled}
              value={(field.value as string) ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              helperText={errorMessage ?? 'dd/mm/aaaa'}
              variant="outlined"
              sx={fieldSx}
              placeholder="dd/mm/aaaa"
              InputProps={{ inputComponent: DataMaskCustom as never }}
            />
          );
        }

        if (campo.tipo === 'rg') {
          return (
            <TextField
              label={label}
              fullWidth
              disabled={disabled}
              value={(field.value as string) ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              helperText={errorMessage}
              variant="outlined"
              sx={fieldSx}
              placeholder="00.000.000-0"
              InputProps={{ inputComponent: RGMaskCustom as never }}
            />
          );
        }

        // tipo 'texto' (padrão)
        return (
          <TextField
            label={label}
            fullWidth
            disabled={disabled}
            value={(field.value as string) ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            error={!!fieldState.error}
            helperText={errorMessage}
            variant="outlined"
            sx={fieldSx}
          />
        );
      }}
    />
  );
};
