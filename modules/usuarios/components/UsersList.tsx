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
  Alert,
  IconButton,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useListarUsuariosQuery } from '@/config/redux/api/usersApi';
import { CreateUserForm } from './CreateUserForm';

export function UsersList() {
  const [openCreate, setOpenCreate] = useState(false);
  const { data: users = [], isLoading, error } = useListarUsuariosQuery();

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
    </Box>
  );
}
