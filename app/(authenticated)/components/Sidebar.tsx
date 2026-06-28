"use client";

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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { BORDER_RADIUS } from "@/config/utils/contants";
import { usePermissions } from "@/lib/hooks/usePermissions";
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
];

const DRAWER_WIDTH = 240;

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

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          minHeight: {
            xs: 52,
            sm: 61,
          },
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
        borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
            IFC Maravilhas
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        {menuSections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.allowedRoles ? is(...item.allowedRoles) : true
          );
          if (visibleItems.length === 0) return null;
          return (
          <Box key={section.title} sx={{ mb: 3 }}>
            {section.title && (
              <Typography
                variant="caption"
                sx={{
                  px: 2.5,
                  display: "block",
                  color: "#999",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}
              >
                {section.title}
              </Typography>
            )}
            <List sx={{ px: 1.5 }}>
              {visibleItems.map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={pathname === item.href}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      }
                      if (isMobile) {
                        onClose();
                      }
                    }}
                    sx={{
                      borderRadius: BORDER_RADIUS.small,
                      p: 0.5,
                      py: 0.75,
                      "&.Mui-selected": {
                        bgcolor: "#EDEDFE",
                        color: "#5B5FED",
                        "& .MuiListItemIcon-root": {
                          color: "#5B5FED",
                        },
                        "&:hover": {
                          bgcolor: "#E5E5FD",
                        },
                        "::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-12px",
                          height: "100%",
                          width: "4px",
                          borderTopRightRadius: BORDER_RADIUS.full,
                          borderBottomRightRadius: BORDER_RADIUS.full,
                          bgcolor: "#5B5FED",
                        },
                      },
                      "&:hover": {
                        bgcolor: "#F5F5F5",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "#666",
                        justifyContent: "center",
                        minWidth: 35,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: 500,
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
                          bgcolor: "#F5F5F5",
                          color: "#666",
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
                          bgcolor: "#E8E8FF",
                          color: "#5B5FED",
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: DRAWER_WIDTH },
        flexShrink: { sm: 0 },
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
