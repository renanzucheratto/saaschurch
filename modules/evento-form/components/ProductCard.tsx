'use client';

import { Box, Card, CardContent, Typography, Radio } from '@mui/material';
import { ProdutoEvento } from '@/config/redux';

interface ProductCardProps {
  produto: ProdutoEvento;
  selected: boolean;
  onSelect: (produtoId: string) => void;
}

export const ProductCard = ({ produto, selected, onSelect }: ProductCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card
      onClick={() => onSelect(produto.id)}
      sx={{
        cursor: 'pointer',
        minWidth: 280,
        maxWidth: 320,
        height: '100%',
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'grey.300',
        backgroundColor: selected ? 'primary.50' : 'background.paper',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
        }}
      >
        <Radio
          checked={selected}
          onChange={() => onSelect(produto.id)}
          sx={{
            padding: 0,
            '& .MuiSvgIcon-root': {
              fontSize: 24,
            },
          }}
        />
      </Box>
      <CardContent sx={{ p: 2.5, pb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="subtitle1" 
          component="h3" 
          sx={{ 
            fontWeight: 700,
            fontSize: '1rem',
            mb: 1.5,
            pr: 4,
            lineHeight: 1.3,
          }}
        >
          {produto.nome}
        </Typography>
        <Box sx={{ flex: 1, mb: 2 }}>
          {produto.descricao && (
            <Box
              sx={{
                fontSize: '0.75rem',
                color: 'text.secondary',
                '& div': { fontSize: '0.75rem !important', padding: '6px !important', margin: '4px 0 !important' },
                '& strong': { fontSize: '0.75rem !important' },
              }}
              dangerouslySetInnerHTML={{ __html: produto.descricao }}
            />
          )}
        </Box>
        <Box
          sx={{
            mt: 'auto',
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h6"
            color="primary.main"
            sx={{ 
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            {formatCurrency(produto.valor)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
