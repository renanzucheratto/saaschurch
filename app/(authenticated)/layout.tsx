"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function LayoutAuthenticated({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#FAFAFA" }}>
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerClose} />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Navbar */}
        <Navbar onMenuClick={handleDrawerToggle} />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            px: 2.5,
            py: 2,
            bgcolor: "#FAFAFA",
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}