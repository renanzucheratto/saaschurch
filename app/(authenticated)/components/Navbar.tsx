"use client";

import { AppBar, Toolbar, Box, IconButton, Tooltip } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        <Box />
        
        <Tooltip title="Sair">
          <IconButton
            onClick={handleLogout}
            sx={{
              color: "#666",
              "&:hover": { 
                bgcolor: "#FEE2E2",
                color: "#DC2626",
              },
            }}
          >
            <IconifyIcon icon="material-symbols:logout" width={24} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
