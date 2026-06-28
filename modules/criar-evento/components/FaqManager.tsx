'use client';
import { useFieldArray, Controller } from 'react-hook-form';
import {
  Box,
  Typography,
  Button,
  Card,
  Stack,
  TextField,
  IconButton,
} from '@mui/material';
import { Icon as IconifyIcon } from '@iconify/react';
import type { Control, FieldErrors } from 'react-hook-form';
import type { CriarEventoSchema } from '../schemas/criar-evento.schema';
import RichTextEditor from './RichTextEditor';

interface FaqManagerProps {
  control: Control<CriarEventoSchema>;
  errors: FieldErrors<CriarEventoSchema>;
}

export function FaqManager({ control, errors }: FaqManagerProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'faq',
  });

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1A1A1A' }}>
            Perguntas Frequentes (FAQ)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adicione perguntas e respostas frequentes sobre o evento (opcional)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconifyIcon icon="material-symbols:add" width={18} />}
          onClick={() => append({ pergunta: '', resposta: '' })}
          sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          Adicionar pergunta
        </Button>
      </Stack>

      {fields.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: '#999' }}>
          <IconifyIcon icon="material-symbols:help-outline" width={40} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Nenhuma pergunta adicionada
          </Typography>
        </Box>
      )}

      <Stack spacing={2}>
        {fields.map((field, index) => (
          <Card key={field.id} variant="outlined" sx={{ p: 2, bgcolor: '#FAFAFA', position: 'relative' }}>
            <IconButton
              size="small"
              onClick={() => remove(index)}
              sx={{ position: 'absolute', top: 8, right: 8, color: '#999', '&:hover': { color: '#d32f2f' } }}
            >
              <IconifyIcon icon="material-symbols:close" width={18} />
            </IconButton>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', mb: 1.5, display: 'block' }}>
              Pergunta {index + 1}
            </Typography>
            <Stack spacing={2}>
              <Controller
                name={`faq.${index}.pergunta`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Pergunta"
                    fullWidth
                    size="small"
                    error={!!errors.faq?.[index]?.pergunta}
                    helperText={errors.faq?.[index]?.pergunta?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                )}
              />
              <Controller
                name={`faq.${index}.resposta`}
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    label="Resposta"
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={!!errors.faq?.[index]?.resposta}
                    helperText={errors.faq?.[index]?.resposta?.message}
                  />
                )}
              />
            </Stack>
          </Card>
        ))}
      </Stack>
    </Card>
  );
}
