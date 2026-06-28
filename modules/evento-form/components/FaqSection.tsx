'use client';
import { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Icon as IconifyIcon } from '@iconify/react';
import type { FaqItem } from '@/types/evento.types';

const BRAND = '#513B89';

interface FaqSectionProps {
  faq: FaqItem[];
}

export function FaqSection({ faq }: FaqSectionProps) {
  const [expanded, setExpanded] = useState<number | false>(false);

  if (!faq || faq.length === 0) return null;

  const handleChange = (index: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? index : false);
  };

  return (
    <Stack sx={{ px: { xs: 2, md: 3 }, gap: 6, backgroundColor: '#fbf5ff' }}>
      <Divider />
      <Box sx={{ maxWidth: 820, mx: 'auto', width: '100%' }}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            fontWeight: 800,
            color: '#0f0f1a',
            textAlign: 'center',
          }}
        >
          Perguntas Frequentes
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: '0.95rem', textAlign: 'center' }}>
          Tire suas dúvidas sobre o evento
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {faq.map((item, index) => (
            <Accordion
              key={index}
              expanded={expanded === index}
              onChange={handleChange(index)}
              disableGutters
              elevation={0}
              sx={{
                border: `1.5px solid #e5e7eb`,
                borderRadius: '8px !important',
                backgroundColor: 'white',
                transition: 'border-color 0.2s',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <IconifyIcon
                    icon="material-symbols:keyboard-arrow-down"
                    width={24}
                    color={expanded === index ? BRAND : '#6b7280'}
                  />
                }
                sx={{
                  px: 3,
                  py: 0.5,
                  '& .MuiAccordionSummary-content': { my: 1.5 },
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                    transform: 'rotate(180deg)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: expanded === index ? BRAND : '#1a1a2e',
                    lineHeight: 1.4,
                    pr: 1,
                  }}
                >
                  {item.pergunta}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  px: 3,
                  pt: 0,
                  pb: 2.5,
                  borderTop: `1px solid ${BRAND}22`,
                }}
              >
                <Box
                  dangerouslySetInnerHTML={{ __html: item.resposta }}
                  sx={{
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                    lineHeight: 1.75,
                    pt: 1,
                    '& p': { margin: '0.4em 0' },
                    '& strong, & b': { color: '#1a1a2e' },
                    '& a': { color: BRAND },
                    '& ul, & ol': { pl: 2.5, my: 0.5 },
                  }}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
      <Divider />
    </Stack>
  );
}
