'use client';

import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useAtualizarPapelMutation, useRemoverMembroMutation } from '@/config/redux/api/areasApi';
import { AreaMembro, RoleNaArea } from '@/types/area.types';

interface Props {
  areaId: string;
  membro: AreaMembro;
  roleNaArea: RoleNaArea;
  podeGerenciar: boolean;
  userType: string;
}

export function MembroRow({ areaId, membro, roleNaArea, podeGerenciar, userType }: Props) {
  const [editingRole, setEditingRole] = useState(false);
  const [atualizarPapel, { isLoading: updatingPapel }] = useAtualizarPapelMutation();
  const [removerMembro, { isLoading: removendo }] = useRemoverMembroMutation();

  const isBackoffice = userType === 'backoffice';

  // Líderes só podem ser gerenciados por backoffice
  // Membros podem ser removidos por backoffice ou lider da área, mas papel só backoffice altera
  const podeRemover = roleNaArea === 'lider' ? isBackoffice : podeGerenciar;
  const podeAlterarPapel = isBackoffice;

  const handleRoleChange = async (novoRole: RoleNaArea) => {
    try {
      await atualizarPapel({ areaId, userId: membro.id, roleNaArea: novoRole }).unwrap();
    } catch {}
    setEditingRole(false);
  };

  const handleRemover = async () => {
    try {
      await removerMembro({ areaId, userId: membro.id }).unwrap();
    } catch {}
  };

  const initials = membro.nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const temAcao = podeRemover || podeAlterarPapel;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1,
        px: 1.5,
        borderRadius: 1,
        '&:hover': { bgcolor: '#F5F5F5' },
      }}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: 12 }}>
        {initials}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }} noWrap>
          {membro.nome}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {membro.email}
        </Typography>
      </Box>

      {temAcao ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {podeAlterarPapel && editingRole ? (
            <Select
              value={roleNaArea}
              onChange={(e) => handleRoleChange(e.target.value as RoleNaArea)}
              size="small"
              autoFocus
              onBlur={() => setEditingRole(false)}
              sx={{ fontSize: 12, minWidth: 90 }}
            >
              <MenuItem value="lider">Líder</MenuItem>
              <MenuItem value="membro">Membro</MenuItem>
            </Select>
          ) : (
            <Tooltip title={podeAlterarPapel ? 'Alterar papel' : undefined}>
              <Box
                onClick={podeAlterarPapel ? () => setEditingRole(true) : undefined}
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: roleNaArea === 'lider' ? '#E8E8FF' : '#F5F5F5',
                  color: roleNaArea === 'lider' ? '#5B5FED' : '#666',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: podeAlterarPapel ? 'pointer' : 'default',
                  textTransform: 'capitalize',
                  '&:hover': podeAlterarPapel ? { opacity: 0.8 } : {},
                }}
              >
                {roleNaArea === 'lider' ? 'Líder' : 'Membro'}
              </Box>
            </Tooltip>
          )}

          {podeRemover && (
            updatingPapel || removendo ? (
              <CircularProgress size={18} />
            ) : (
              <Tooltip title="Remover da área">
                <IconButton size="small" onClick={handleRemover} sx={{ color: '#999' }}>
                  <Icon icon="material-symbols:close" width={16} />
                </IconButton>
              </Tooltip>
            )
          )}
        </Box>
      ) : (
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: roleNaArea === 'lider' ? '#E8E8FF' : '#F5F5F5',
            color: roleNaArea === 'lider' ? '#5B5FED' : '#666',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {roleNaArea === 'lider' ? 'Líder' : 'Membro'}
        </Box>
      )}
    </Box>
  );
}
