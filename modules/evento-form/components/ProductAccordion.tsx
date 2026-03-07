'use client';

import { useState } from 'react';
import { Box, Typography, Button, Collapse, Divider } from '@mui/material';
import { ProdutoEvento } from '@/config/redux';

interface ProductAccordionProps {
  produto: ProdutoEvento;
  selected: boolean;
  onSelect: (produtoId: string) => void;
}

export const ProductAccordion = ({ produto, selected, onSelect }: ProductAccordionProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        bgcolor: selected ? 'primary.50' : 'white',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          gap: 2,
        }}
      >
        <Button
          variant={selected ? 'contained' : 'outlined'}
          size="small"
          onClick={() => onSelect(produto.id)}
          sx={{
            minWidth: 100,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
          }}
        >
          {selected ? 'Selecionado' : 'Escolher'}
        </Button>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {produto.nome}
          </Typography>
        </Box>

        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontWeight: 500,
            minWidth: 'auto',
          }}
        >
          {expanded ? '▲ Ver menos' : '▼ Ver mais'}
        </Button>
      </Box>

      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2, pt: 2 }}>
          {produto.descricao && (
            <Box
              sx={{
                fontSize: '0.875rem',
                color: 'text.secondary',
                '& div': {
                  fontSize: '0.875rem !important',
                  padding: '8px !important',
                  margin: '6px 0 !important',
                },
                '& strong': {
                  fontSize: '0.875rem !important',
                },
              }}
              dangerouslySetInnerHTML={{ __html: produto.descricao }}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
