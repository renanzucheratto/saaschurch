"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { UserSync } from "./components/UserSync";

export default function LayoutAuthenticated({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "background.default",
        p: { xs: 0, sm: 1.5 },
        gap: { sm: 1.5 },
      }}
    >
      <UserSync />
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerClose} />

      {/* Área de conteúdo */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: { sm: 1 },
        }}
      >
        {/* Header */}
        <Navbar onMenuClick={handleDrawerToggle} />

        {/* Conteúdo da página */}
        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, sm: 2.5 },
            py: 2,
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
