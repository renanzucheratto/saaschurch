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
  Avatar,
  IconButton,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  isBeta?: boolean;
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
      { id: "eventos", label: "Lista de Eventos", icon: <IconifyIcon icon="material-symbols:event-outline" width={20} />, href: "/eventos" },
      { id: "criar-evento", label: "Criar evento", icon: <IconifyIcon icon="material-symbols:add-circle-outline" width={20} />, href: "/eventos/criar" },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Box
      sx={{
        width: collapsed ? 80 : 240,
        minWidth: collapsed ? 80 : 240,
        height: "100vh",
        bgcolor: "#FAFAFA",
        borderRight: "1px solid #E0E0E0",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease, min-width 0.3s ease",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: "65px",
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid #E0E0E0",
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
              IFC Maravilhas
            </Typography>
          </Box>
        )}
        <IconButton
          size="small"
          onClick={() => setCollapsed(!collapsed)}
          sx={{ color: "#666" }}
        >
          {collapsed ? <IconifyIcon icon="material-symbols:chevron-right" width={20} /> : <IconifyIcon icon="material-symbols:chevron-left" width={20} />}
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        {menuSections.map((section) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            {!collapsed && (
              <Typography
                variant="caption"
                sx={{
                  px: 2.5,
                  mb: 1,
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
              {section.items.map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={pathname === item.href}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    sx={{
                      borderRadius: 1.5,
                      py: 1.25,
                      px: collapsed ? 1.5 : 2,
                      justifyContent: collapsed ? "center" : "flex-start",
                      "&.Mui-selected": {
                        bgcolor: "#EDEDFE",
                        color: "#5B5FED",
                        "& .MuiListItemIcon-root": {
                          color: "#5B5FED",
                        },
                        "&:hover": {
                          bgcolor: "#E5E5FD",
                        },
                      },
                      "&:hover": {
                        bgcolor: "#F5F5F5",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 40,
                        color: "#666",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
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
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
