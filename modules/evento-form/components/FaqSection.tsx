'use client';
import { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { Icon as IconifyIcon } from '@iconify/react';
import type { FaqItem } from '@/types/evento.types';

const BRAND = '#513B89';

interface FaqSectionProps {
  faq: FaqItem[];
}

export function FaqSection({ faq }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faq || faq.length === 0) return null;

  return (
    <Box sx={{ maxWidth: 820, mx: 'auto', px: { xs: 2, md: 3 }, pb: 8 }}>
      <Typography
        component="h2"
        sx={{
          fontSize: { xs: '1.5rem', md: '1.75rem' },
          fontWeight: 800,
          color: '#0f0f1a',
          mb: 1,
          textAlign: 'center',
        }}
      >
        Perguntas Frequentes
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 5, fontSize: '0.95rem', textAlign: 'center' }}>
        Tire suas dúvidas sobre o evento
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {faq.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <Box
              key={index}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              sx={{
                border: `1.5px solid ${isOpen ? BRAND : '#e5e7eb'}`,
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s',
                bgcolor: isOpen ? `${BRAND}08` : 'white',
                '&:hover': {
                  borderColor: isOpen ? BRAND : '#c4b5e0',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 3,
                  py: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: isOpen ? BRAND : '#1a1a2e',
                    pr: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {item.pergunta}
                </Typography>
                <Box
                  sx={{
                    flexShrink: 0,
                    color: isOpen ? BRAND : '#6b7280',
                    transition: 'transform 0.25s',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'flex',
                  }}
                >
                  <IconifyIcon icon="material-symbols:keyboard-arrow-down" width={24} />
                </Box>
              </Box>
              <Collapse in={isOpen}>
                <Box
                  sx={{
                    px: 3,
                    pb: 2.5,
                    borderTop: `1px solid ${BRAND}22`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      color: 'text.secondary',
                      lineHeight: 1.75,
                      whiteSpace: 'pre-line',
                      pt: 1.5,
                    }}
                  >
                    {item.resposta}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
