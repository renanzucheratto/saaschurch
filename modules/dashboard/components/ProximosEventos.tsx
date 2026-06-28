"use client";

import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { DashboardStats } from "@/config/redux/api/dashboardApi";

interface Props {
  data: DashboardStats["proximosEventos"] | undefined;
  isLoading: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProximosEventos({ data = [], isLoading }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
      <CardContent sx={{p: 0}}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Próximos eventos
        </Typography>
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height={52} sx={{ mb: 0.5 }} />
            ))}
          </>
        ) : data.length === 0 ? (
          <Typography color="text.secondary" variant="body2" mt={1}>
            Nenhum evento futuro.
          </Typography>
        ) : (
          <List disablePadding>
            {data.map((evento, i) => (
              <ListItem
                key={evento.id}
                disablePadding
                divider={i < data.length - 1}
                sx={{ py: 1 }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {evento.nome}
                    </Typography>
                  }
                  secondary={formatDate(evento.data_inicio)}
                />
                <Box flexShrink={0} ml={1}>
                  <Chip
                    label={`${evento._count.participantes} inscritos`}
                    size="small"
                    sx={{ fontSize: 11, bgcolor: "rgba(123,87,223,0.08)", color: "#7b57df" }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
