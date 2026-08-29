"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Drawer,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { BORDER_RADIUS } from "@/config/utils/contants";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useAppSelector } from "@/config/redux/store";
import { logout } from "@/config/redux/slices/authSlice";
import { formatFirstLastName } from "@/config/helpers/name-formatter";
import { useGetCurrentUserQuery } from "@/config/redux/api/authApi";
import type { UserRole } from "@/lib/permissions";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  isBeta?: boolean;
  allowedRoles?: UserRole[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <IconifyIcon icon="material-symbols:dashboard-outline" width={20} />, href: "/" },
    ],
  },
  {
    title: "EVENTOS",
    items: [
      { id: "eventos", label: "Lista de Eventos", icon: <IconifyIcon icon="material-symbols:event-outline" width={20} />, href: "/eventos", allowedRoles: ["lider", "backoffice"] },
      { id: "criar-evento", label: "Criar evento", icon: <IconifyIcon icon="material-symbols:add-circle-outline" width={20} />, href: "/eventos/criar", allowedRoles: ["lider", "backoffice"] },
    ],
  },
  {
    title: "PROJETOS",
    items: [
      { id: "projetos", label: "Lista de Projetos", icon: <IconifyIcon icon="material-symbols:folder-managed-outline" width={20} />, href: "/projetos", allowedRoles: ["lider", "backoffice"] },
      { id: "criar-projeto", label: "Criar projeto", icon: <IconifyIcon icon="material-symbols:create-new-folder-outline" width={20} />, href: "/projetos/criar", allowedRoles: ["lider", "backoffice"] },
    ],
  },
  {
    title: "GERENCIAMENTO",
    items: [
      { id: "usuarios", label: "Usuários", icon: <IconifyIcon icon="material-symbols:group-outline" width={20} />, href: "/usuarios", allowedRoles: ["backoffice"] },
      { id: "areas", label: "Áreas", icon: <IconifyIcon icon="material-symbols:group-work-outline" width={20} />, href: "/areas", allowedRoles: ["lider", "backoffice", "membro"] },
    ],
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      // { id: "planos", label: "Planos", icon: <IconifyIcon icon="material-symbols:workspace-premium-outline" width={20} />, href: "/configuracoes/planos", allowedRoles: ["backoffice"] },
      { id: "pagamentos", label: "Pagamentos", icon: <IconifyIcon icon="material-symbols:credit-card-outline" width={20} />, href: "/configuracoes/pagamentos", allowedRoles: ["backoffice"] },
      // Mensalidade desativada por ora — o produto ainda não cobra as instituições.
      // Para reativar: descomentar aqui e o corpo de /configuracoes/assinatura/page.tsx.
      // { id: "assinatura", label: "Mensalidade", icon: <IconifyIcon icon="material-symbols:receipt-long-outline" width={20} />, href: "/configuracoes/assinatura", allowedRoles: ["backoffice"] },
    ],
  },
];

const DRAWER_WIDTH = 280;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { is } = usePermissions();
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetCurrentUserQuery();

  const userName = user?.nome;
  const email = user?.email;

  const instituicaoNome = currentUser?.instituicao?.nome ?? "";
  const instituicaoLogo = currentUser?.instituicao?.logoUrl ?? null;
  const instituicaoIniciais =
    instituicaoNome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";

  const handleLogout = async () => {
    setAnchorEl(null);
    dispatch(logout());
    await signOut({ callbackUrl: "/login" });
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Marca */}
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.25,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          {isLoadingCurrentUser ? (
            <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: 2, flexShrink: 0 }} />
          ) : (
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 2,
                bgcolor: instituicaoLogo ? "transparent" : "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontWeight: 700,
                fontSize: 14,
                overflow: "hidden",
              }}
            >
              {instituicaoLogo ? (
                <Box
                  component="img"
                  src={instituicaoLogo}
                  alt={instituicaoNome}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                instituicaoIniciais
              )}
            </Box>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {isLoadingCurrentUser ? (
              <Skeleton variant="text" width="70%" sx={{ fontSize: 14 }} />
            ) : (
              <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }} noWrap>
                {instituicaoNome}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Navegação */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {menuSections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.allowedRoles ? is(...item.allowedRoles) : true
          );
          if (visibleItems.length === 0) return null;
          return (
            <Box key={section.title || "root"} sx={{ mb: 2.5 }}>
              {section.title && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 2.5,
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: 0.8,
                    mb: 0.7,
                  }}
                >
                  {section.title}
                </Typography>
              )}
              <List sx={{ px: 1.5, py: 0 }}>
                {visibleItems.map((item) => {
                  const selected = pathname === item.href;
                  return (
                    <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        selected={selected}
                        onClick={() => {
                          if (item.href) {
                            router.push(item.href);
                          }
                          if (isMobile) {
                            onClose();
                          }
                        }}
                        sx={{
                          borderRadius: 2,
                          px: 1,
                          py: 0.7,
                          "&.Mui-selected": {
                            bgcolor: "primary.main",
                            color: "white",
                            "& .MuiListItemIcon-root": {
                              color: "white",
                            },
                            "&:hover": {
                              bgcolor: "primary.dark",
                            },
                          },
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: "text.secondary",
                            justifyContent: "center",
                            minWidth: 34,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: selected ? 600 : 500,
                          }}
                        />
                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              bgcolor: "action.hover",
                              color: "text.secondary",
                            }}
                          />
                        )}
                        {item.isBeta && (
                          <Chip
                            label="BETA"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor: "action.selected",
                              color: "primary.main",
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* Perfil */}
      <Box sx={{ p: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "start",
            textAlign: 'left',
            textTransform: 'none',
            gap: 1.25,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            backgroundColor: 'background.paper'
          }}
          component={Button}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          fullWidth
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 15 }}>
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
              {formatFirstLastName(userName || "")}
            </Typography>
            {email && (
              <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap component="div">
                {email}
              </Typography>
            )}
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{
            ".MuiPaper-root": {
              minWidth: 220,
              boxShadow: "0 0 30px rgba(0,0,0,0.12)",
              borderRadius: BORDER_RADIUS.medium,
            },
          }}
        >
          <MenuItem onClick={handleLogout} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconifyIcon icon="material-symbols:logout" width={18} />
            <Typography variant="body2">Sair</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop: card flutuante */}
      <Box
        component="nav"
        sx={{
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          width: DRAWER_WIDTH,
          flexShrink: 0,
          bgcolor: "#fbfbfb",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          boxShadow: "0 1px 3px rgba(16,12,40,0.04)",
          overflow: "hidden",
        }}
      >
        {drawerContent}
      </Box>
    </>
  );
}
