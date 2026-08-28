'use client';

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useState, ChangeEvent } from 'react';
import { useListarAreasQuery, useCriarAreaMutation } from '@/config/redux/api/areasApi';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { BORDER_RADIUS } from '@/config/utils/contants';

interface Props {
  onSelectArea: (id: string) => void;
}

export function AreasLista({ onSelectArea }: Props) {
  const { can } = usePermissions();
  const podeGerenciar = can('gerenciarArea');

  const { data: areas = [], isLoading, error } = useListarAreasQuery();
  const [criarArea, { isLoading: criando, error: erroCriar }] = useCriarAreaMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState('#6366f1');

  const handleCriar = async () => {
    if (!novoNome.trim()) return;
    try {
      const area = await criarArea({ nome: novoNome, cor: novaCor }).unwrap();
      setNovoNome('');
      setNovaCor('#6366f1');
      setOpenDialog(false);
      onSelectArea(area.id);
    } catch {}
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Áreas
        </Typography>
        {podeGerenciar && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Icon icon="material-symbols:add" />}
            onClick={() => setOpenDialog(true)}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            Nova Área
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar áreas.
        </Alert>
      )}

      {areas.length === 0 && !isLoading && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Icon icon="material-symbols:group-work-outline" width={48} style={{ opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Nenhuma área cadastrada ainda.
          </Typography>
          {podeGerenciar && (
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              onClick={() => setOpenDialog(true)}
            >
              Criar primeira área
            </Button>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {areas.map((area) => (
          <Card key={area.id} variant="outlined" sx={{ borderRadius: BORDER_RADIUS.medium }}>
            <CardActionArea onClick={() => onSelectArea(area.id)}>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: area.cor ?? '#9e9e9e',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {area.nome}
                    </Typography>
                  </Stack>
                  <Icon icon="material-symbols:chevron-right" width={20} color="#999" />
                </Stack>
                <Stack direction="row" gap={2}>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Icon icon="material-symbols:star-outline" width={14} color="#6366f1" />
                    <Typography variant="caption" color="text.secondary">
                      {area.lideres.length} líder{area.lideres.length !== 1 ? 'es' : ''}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Icon icon="material-symbols:person-outline" width={14} color="#666" />
                    <Typography variant="caption" color="text.secondary">
                      {area.membros.length} membro{area.membros.length !== 1 ? 's' : ''}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Nova Área
          <IconButton onClick={() => setOpenDialog(false)}>
            <Icon icon="material-symbols:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {erroCriar && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(erroCriar as any)?.data?.error || 'Erro ao criar área'}
            </Alert>
          )}
          <Stack direction="row" gap={2} alignItems="flex-start" sx={{ mt: 1 }}>
            <TextField
              label="Nome da área"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              fullWidth
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCriar();
              }}
            />
            <Box
              component="input"
              type="color"
              value={novaCor}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNovaCor(e.target.value)}
              sx={{
                width: 56,
                height: 56,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                p: 0.5,
                flexShrink: 0,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCriar}
            disabled={!novoNome.trim() || criando}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            {criando ? <CircularProgress size={20} color="inherit" /> : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
