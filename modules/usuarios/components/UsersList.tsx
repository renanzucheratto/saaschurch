import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Icon } from '@iconify/react';
import { useState, type MouseEvent } from 'react';
import { useListarUsuariosQuery, useExcluirUsuarioMutation, type User } from '@/config/redux/api/usersApi';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { CreateUserForm } from './CreateUserForm';

export function UsersList() {
  const [openCreate, setOpenCreate] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { is } = usePermissions();
  const isBackoffice = is('backoffice');

  const { data: users = [], isLoading, error } = useListarUsuariosQuery();
  const [excluirUsuario, { isLoading: isDeleting }] = useExcluirUsuarioMutation();

  const handleOpenMenu = (event: MouseEvent<HTMLElement>, user: User) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleAskDelete = () => {
    setDeleteTarget(selectedUser);
    handleCloseMenu();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await excluirUsuario(deleteTarget.id).unwrap();
      setSnackbar({ open: true, message: 'Usuário excluído com sucesso!', severity: 'success' });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setSnackbar({ open: true, message: 'Erro ao excluir usuário. Tente novamente.', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'nome',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'userType',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'backoffice' ? 'primary' : 'default'}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'telefone',
      headerName: 'Telefone',
      width: 150,
      valueGetter: (value) => value || '-',
    },
    {
      field: 'instituicao',
      headerName: 'Instituição',
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => row.instituicao?.nome || '-',
    },
    ...(isBackoffice
      ? [
          {
            field: 'acoes',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: { row: User }) => (
              <IconButton size="small" onClick={(e) => handleOpenMenu(e, params.row)}>
                <Icon icon="material-symbols:more-vert" />
              </IconButton>
            ),
          } as GridColDef,
        ]
      : []),
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Gestão de Usuários
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => setOpenCreate(true)}
          size="small"
          sx={{ backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}
        >
          Novo Usuário
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar usuários. Verifique suas permissões.
        </Alert>
      )}

      <Card variant="outlined">
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          autoHeight
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#FAFAFA',
              borderBottom: '2px solid #E0E0E0',
              fontWeight: 600,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #F0F0F0',
            },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Card>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Criar Novo Usuário
          <IconButton onClick={() => setOpenCreate(false)}>
            <Icon icon="material-symbols:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CreateUserForm
            onSuccess={() => {
              setOpenCreate(false);
            }}
            onCancel={() => setOpenCreate(false)}
          />
        </DialogContent>
      </Dialog>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={handleCloseMenu}>
        <MenuItem onClick={handleAskDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Icon icon="material-symbols:delete-outline" color="inherit" />
          </ListItemIcon>
          <ListItemText>Excluir usuário</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={!!deleteTarget} onClose={!isDeleting ? () => setDeleteTarget(null) : undefined} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Excluir Usuário</DialogTitle>
        <DialogContent>
          <Typography>
            Você está excluindo &quot;{deleteTarget?.nome}&quot;. O usuário perderá acesso ao sistema. Quer prosseguir com essa ação?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" color="info" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
