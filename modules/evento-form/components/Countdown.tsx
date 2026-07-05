'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface CountdownProps {
  targetDate: string | null;
  variant?: 'card' | 'hero';
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

const CountBox = ({ value, label, variant }: { value: number; label: string; variant: 'card' | 'hero' }) => {
  const isHero = variant === 'hero';
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isHero ? 'flex-start' : 'center',
        justifyContent: 'center',
        ...(isHero
          ? { minWidth: { xs: 52, sm: 64 } }
          : {
              width: { xs: 72, sm: 90 },
              height: { xs: 72, sm: 90 },
              border: '1.5px solid',
              borderColor: 'rgba(0,0,0,0.12)',
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }),
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: '1.75rem', sm: isHero ? '2.75rem' : '2.25rem' },
          fontWeight: 800,
          lineHeight: 1,
          color: isHero ? '#ffffff' : '#1a1a2e',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(value).padStart(2, '0')}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: '0.6rem', sm: '0.7rem' },
          fontWeight: isHero ? 600 : 500,
          color: isHero ? 'rgba(255,255,255,0.7)' : 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          mt: isHero ? 0.75 : 0.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export const Countdown = ({ targetDate, variant = 'card' }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    setTimeLeft(calcTimeLeft(targetDate));
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate || !timeLeft) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: variant === 'hero' ? 2 : 1.5, sm: variant === 'hero' ? 3 : 2 },
        justifyContent: variant === 'hero' ? 'flex-start' : 'center',
        alignItems: 'center',
      }}
    >
      <CountBox value={timeLeft.dias} label="Dias" variant={variant} />
      <CountBox value={timeLeft.horas} label="Horas" variant={variant} />
      <CountBox value={timeLeft.minutos} label="Minutos" variant={variant} />
      <CountBox value={timeLeft.segundos} label="Segundos" variant={variant} />
    </Box>
  );
};
