"use client";

import { Box, Skeleton, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { DashboardStats } from "@/config/redux/api/dashboardApi";
import { CardWithTitle } from "@/components/card-with-title";

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
    <Box
      sx={{
        display: "grid",
        // 1 card por linha no mobile, 2 no tablet (o terceiro ocupa a linha) e 3 no desktop.
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      {STATS.map(({ key, label, color, bg, icon, descriptionKey }, index) => {
        const description = descriptionKey ? (cards?.[descriptionKey] as string | undefined) : undefined;
        const isUltimo = index === STATS.length - 1;
        return (
          <CardWithTitle
            key={key}
            title={label}
            sx={{ gridColumn: { sm: isUltimo ? "1 / -1" : "auto", md: "auto" } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, height: "100%", minWidth: 0 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: bg,
                  color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon icon={icon} width={18} height={18} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                {isLoading ? (
                  <Skeleton width={60} height={36} />
                ) : (
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" }, lineHeight: 1.2 }}
                  >
                    {cards?.[key] ?? 0}
                  </Typography>
                )}
                {description && (
                  <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>
                    {description}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardWithTitle>
        );
      })}
    </Box>
  );
}
