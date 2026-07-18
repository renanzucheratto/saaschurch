'use client';

import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { useListarContasQuery } from '@/config/redux/api/financeiroApi';
import { ContasTab } from './components/ContasTab';
import { CategoriasTab } from './components/CategoriasTab';
import { FornecedoresTab } from './components/FornecedoresTab';
import { RegrasTab } from './components/RegrasTab';

export function CadastrosView() {
  const [tab, setTab] = useState(0);
  const { data: contas = [], isLoading } = useListarContasQuery();

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Cadastros financeiros
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 44 },
          '& .Mui-selected': { color: '#4f46e5 !important' },
          '& .MuiTabs-indicator': { bgcolor: '#6366f1' },
        }}
      >
        <Tab icon={<Icon icon="material-symbols:account-balance-outline" width={18} />} iconPosition="start" label="Contas bancárias" />
        <Tab icon={<Icon icon="material-symbols:category-outline" width={18} />} iconPosition="start" label="Categorias" />
        <Tab icon={<Icon icon="material-symbols:storefront-outline" width={18} />} iconPosition="start" label="Fornecedores" />
        <Tab icon={<Icon icon="material-symbols:bolt-outline" width={18} />} iconPosition="start" label="Regras" />
      </Tabs>

      {tab === 0 && <ContasTab contas={contas} isLoading={isLoading} />}
      {tab === 1 && <CategoriasTab />}
      {tab === 2 && <FornecedoresTab />}
      {tab === 3 && <RegrasTab />}
    </Box>
  );
}
