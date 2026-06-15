import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useEditarParticipanteMutation } from '@/config/redux/api/eventosApi';
import type { RespostaCustomizadaRequest } from '@/config/redux/api/eventosApi';
import { Participante, Produto, CampoCustomizado } from '@/types/evento.types';
import { CPFMaskCustom, RGMaskCustom, TelefoneMaskCustom } from '@/modules/evento-form/components/MaskInputs';

interface EditParticipanteModalProps {
  open: boolean;
  onClose: () => void;
  participante: Participante | null;
  eventoId: string;
  produtos: Produto[];
  campos?: CampoCustomizado[];
}

export default function EditParticipanteModal({
  open,
  onClose,
  participante,
  eventoId,
  produtos,
  campos = [],
}: EditParticipanteModalProps) {
  const [editarParticipante, { isLoading }] = useEditarParticipanteMutation();
  const temCamposCustomizados = campos.length > 0;
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    rg: '',
    cpf: '',
    termo_assinado: false,
    produtoId: '',
  });
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (participante && open) {
      setFormData({
        nome: participante.nome || '',
        email: participante.email || '',
        telefone: participante.telefone || '',
        rg: participante.rg || '',
        cpf: participante.cpf || '',
        termo_assinado: participante.termo_assinado || false,
        produtoId: participante.produtos?.[0]?.produtoId || '',
      });

      const respostasIniciais: Record<string, string> = {};
      campos.forEach((campo) => {
        const resposta = participante.respostas_customizadas?.find((r) => r.campoId === campo.id);
        if (campo.tipo === 'checkbox') {
          respostasIniciais[campo.id] = (resposta?.valores ?? []).join(', ');
        } else {
          respostasIniciais[campo.id] = resposta?.valor ?? '';
        }
      });
      setRespostas(respostasIniciais);
    }
  }, [participante, open, campos]);

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRespostaChange = (campoId: string, value: string) => {
    setRespostas((prev) => ({ ...prev, [campoId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participante) return;

    try {
      if (temCamposCustomizados) {
        const respostasPayload: RespostaCustomizadaRequest[] = campos.map((campo) => {
          if (campo.tipo === 'checkbox') {
            const valores = (respostas[campo.id] ?? '')
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v.length > 0);
            return { campoId: campo.id, valor: null, valores: valores.length > 0 ? valores : null };
          }
          const valor = (() => {
            const raw = respostas[campo.id] ?? '';
            if (campo.tipo === 'cpf' || campo.tipo === 'rg' || campo.tipo === 'telefone') return raw.replace(/\D/g, '');
            if (campo.tipo === 'email') return raw.trim().toLowerCase();
            return raw;
          })();
          return { campoId: campo.id, valor: valor || null, valores: null };
        });

        await editarParticipante({
          eventoId,
          participanteId: participante.id,
          data: {
            respostas_customizadas: respostasPayload,
            ...(produtos.length > 0 && formData.produtoId ? { produtoId: formData.produtoId } : {}),
          },
        }).unwrap();
      } else {
        await editarParticipante({
          eventoId,
          participanteId: participante.id,
          data: formData,
        }).unwrap();
      }

      setSnackbar({ open: true, message: 'Participante atualizado com sucesso!', severity: 'success' });
      onClose();
    } catch (error: any) {
      console.error('Erro ao editar participante:', error);
      const errorMessage = error?.data?.error || 'Erro ao editar participante. Tente novamente.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (!participante) return null;

  return (
    <>
      <Dialog open={open} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Editar Participante</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {temCamposCustomizados ? (
                <>
                  {campos.map((campo) => {
                    if (campo.tipo === 'aceite_termo') {
                      const termoLabel = campo.textoTermo || campo.label;
                      return (
                        <FormControlLabel
                          key={campo.id}
                          control={
                            <Checkbox
                              checked={respostas[campo.id] === 'true'}
                              onChange={(e) =>
                                handleRespostaChange(campo.id, e.target.checked ? 'true' : '')
                              }
                            />
                          }
                          label={campo.obrigatorio ? `${termoLabel} *` : termoLabel}
                        />
                      );
                    }
                    if (campo.tipo === 'email') {
                      return (
                        <TextField
                          key={campo.id}
                          label={campo.obrigatorio ? `${campo.label} *` : campo.label}
                          type="email"
                          value={respostas[campo.id] ?? ''}
                          onChange={(e) => handleRespostaChange(campo.id, e.target.value)}
                          fullWidth
                        />
                      );
                    }
                    if (campo.tipo === 'telefone') {
                      return (
                        <TextField
                          key={campo.id}
                          label={campo.obrigatorio ? `${campo.label} *` : campo.label}
                          value={respostas[campo.id] ?? ''}
                          onChange={(e) => handleRespostaChange(campo.id, e.target.value)}
                          fullWidth
                          placeholder="(00) 00000-0000"
                          InputProps={{ inputComponent: TelefoneMaskCustom as never }}
                        />
                      );
                    }
                    if (campo.tipo === 'cpf') {
                      return (
                        <TextField
                          key={campo.id}
                          label={campo.obrigatorio ? `${campo.label} *` : campo.label}
                          value={respostas[campo.id] ?? ''}
                          onChange={(e) => handleRespostaChange(campo.id, e.target.value)}
                          fullWidth
                          placeholder="000.000.000-00"
                          InputProps={{ inputComponent: CPFMaskCustom as never }}
                        />
                      );
                    }
                    if (campo.tipo === 'rg') {
                      return (
                        <TextField
                          key={campo.id}
                          label={campo.obrigatorio ? `${campo.label} *` : campo.label}
                          value={respostas[campo.id] ?? ''}
                          onChange={(e) => handleRespostaChange(campo.id, e.target.value)}
                          fullWidth
                          placeholder="00.000.000-0"
                          InputProps={{ inputComponent: RGMaskCustom as never }}
                        />
                      );
                    }
                    return (
                      <TextField
                        key={campo.id}
                        label={campo.obrigatorio ? `${campo.label} *` : campo.label}
                        value={respostas[campo.id] ?? ''}
                        onChange={(e) => handleRespostaChange(campo.id, e.target.value)}
                        fullWidth
                        helperText={campo.tipo === 'checkbox' ? 'Separe múltiplos valores por vírgula' : undefined}
                      />
                    );
                  })}

                  {produtos.length > 0 && (
                    <FormControl fullWidth>
                      <InputLabel id="produto-label">Produto</InputLabel>
                      <Select
                        labelId="produto-label"
                        name="produtoId"
                        value={formData.produtoId}
                        onChange={handleChange}
                        label="Produto"
                      >
                        {produtos.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.nome} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              ) : (
                <>
                  <TextField
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="E-mail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="CPF"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="RG"
                    name="rg"
                    value={formData.rg}
                    onChange={handleChange}
                    fullWidth
                    required
                  />

                  {produtos.length > 0 && (
                    <FormControl fullWidth required>
                      <InputLabel id="produto-label">Produto</InputLabel>
                      <Select
                        labelId="produto-label"
                        name="produtoId"
                        value={formData.produtoId}
                        onChange={handleChange}
                        label="Produto"
                      >
                        {produtos.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.nome} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <FormControlLabel
                    control={
                      <Checkbox
                        name="termo_assinado"
                        checked={formData.termo_assinado}
                        onChange={handleChange}
                      />
                    }
                    label="Termo Assinado"
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
