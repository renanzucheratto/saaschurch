"use client";

import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import { DashboardStats } from "@/config/redux/api/dashboardApi";
import { CardWithTitle } from "@/components/card-with-title";

interface Props {
  data: DashboardStats["ultimosMembros"] | undefined;
  isLoading: boolean;
}

const USER_TYPE_LABEL: Record<string, string> = {
  membro: "Membro",
  lider: "Líder",
  pastor: "Pastor",
  backoffice: "Backoffice",
  tesouraria: "Tesouraria",
};

function initials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = ["#7b57df", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function UltimosMembros({ data = [], isLoading }: Props) {
  return (
    <CardWithTitle title="Últimos membros">
      {isLoading ? (
        <>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={52} sx={{ mb: 0.5 }} />
          ))}
        </>
      ) : data.length === 0 ? (
        <Typography color="text.secondary" variant="body2" mt={1}>
          Nenhum membro cadastrado.
        </Typography>
      ) : (
        <List disablePadding>
          {data.map((membro, i) => (
            <ListItem key={membro.id} disablePadding divider={i < data.length - 1} sx={{ py: 0.75 }}>
              <ListItemAvatar sx={{ minWidth: 44 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: 12,
                    fontWeight: 700,
                    bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  }}
                >
                  {initials(membro.nome)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {membro.nome}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {USER_TYPE_LABEL[membro.userType] ?? membro.userType}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardWithTitle>
  );
}
