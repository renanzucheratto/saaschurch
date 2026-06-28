"use client";

import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { DashboardStats } from "@/config/redux/api/dashboardApi";

interface Props {
  cards: DashboardStats["cards"] | undefined;
  isLoading: boolean;
}

const STATS = [
  {
    key: "totalMembrosAtivos" as const,
    label: "Membros ativos",
    icon: "solar:users-group-rounded-bold-duotone",
    color: "#7b57df",
    bg: "rgba(123,87,223,0.12)",
    descriptionKey: undefined as keyof DashboardStats["cards"] | undefined,
  },
  {
    key: "eventosMes" as const,
    label: "Eventos este mês",
    icon: "solar:calendar-bold-duotone",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    descriptionKey: "eventosMesDescricao" as keyof DashboardStats["cards"],
  },
  {
    key: "participantesMes" as const,
    label: "Participantes este mês",
    icon: "solar:user-check-rounded-bold-duotone",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    descriptionKey: undefined as keyof DashboardStats["cards"] | undefined,
  },
];

export function StatCards({ cards, isLoading }: Props) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
      {STATS.map(({ key, label, color, bg, icon, descriptionKey }) => {
        const description = descriptionKey ? (cards?.[descriptionKey] as string | undefined) : undefined;
        return (
          <Card key={key} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent
              sx={{
                padding: 0,
                pb: "0!important",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  bgcolor: bg,
                  color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon icon={icon} width={26} height={26} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {label}
                </Typography>
                {isLoading ? (
                  <Skeleton width={60} height={36} />
                ) : (
                  <Typography variant="h4" fontWeight={700} color={color}>
                    {cards?.[key] ?? 0}
                  </Typography>
                )}
                {description && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>
                    {description}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
