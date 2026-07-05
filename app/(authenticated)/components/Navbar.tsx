"use client";

import { Box, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <Box
      sx={{
        display: {xs: "flex", sm: "none"},
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: { xs: 48, sm: 40 },
        px: { xs: 2, sm: 0 },
      }}
    >
      <IconButton
        aria-label="abrir menu"
        edge="start"
        onClick={onMenuClick}
        sx={{ color: "text.secondary" }}
      >
        <Icon icon="material-symbols:menu" />
      </IconButton>
      {/* slot direito para ações por página */}
      <Box />
    </Box>
  );
}
