'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface CountdownProps {
  targetDate: string | null;
}

interface TimeLeft {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

const calcTimeLeft = (targetDate: string): TimeLeft => {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
};

const CountBox = ({ value, label }: { value: number; label: string }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: { xs: 72, sm: 90 },
      height: { xs: 72, sm: 90 },
      border: '1.5px solid',
      borderColor: 'rgba(0,0,0,0.12)',
      borderRadius: 3,
      bgcolor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}
  >
    <Typography
      sx={{
        fontSize: { xs: '1.75rem', sm: '2.25rem' },
        fontWeight: 800,
        lineHeight: 1,
        color: '#1a1a2e',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {String(value).padStart(2, '0')}
    </Typography>
    <Typography
      sx={{
        fontSize: { xs: '0.6rem', sm: '0.7rem' },
        fontWeight: 500,
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mt: 0.5,
      }}
    >
      {label}
    </Typography>
  </Box>
);

export const Countdown = ({ targetDate }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    setTimeLeft(calcTimeLeft(targetDate));
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate || !timeLeft) return null;

  return (
    <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, justifyContent: 'center', alignItems: 'center' }}>
      <CountBox value={timeLeft.dias} label="Dias" />
      <CountBox value={timeLeft.horas} label="Horas" />
      <CountBox value={timeLeft.minutos} label="Minutos" />
      <CountBox value={timeLeft.segundos} label="Segundos" />
    </Box>
  );
};
