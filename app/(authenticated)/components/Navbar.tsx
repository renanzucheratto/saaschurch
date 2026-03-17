"use client";

import { AppBar, Toolbar, Box, IconButton, Tooltip, Button, Stack, Typography, Avatar, Menu, MenuItem } from "@mui/material";
import { Icon } from "@iconify/react";
import { signOut } from "next-auth/react";
import { useAppSelector } from "@/config/redux/store";
import { BORDER_RADIUS } from "@/config/utils/contants";
import { formatFirstLastName } from "@/config/helpers/name-formatter";
import { useState } from "react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user } = useAppSelector((state) => state.auth);
  const userName = user?.nome;
  const email = user?.email;
  const handleLogout = async () => {
    setAnchorEl(null);
    await signOut({ callbackUrl: "/login" });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
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
      <Toolbar sx={{ justifyContent: "space-between", px: '16px!important', minHeight: {
        xs: 50,
        sm: 60,
      } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { sm: "none" }, color: "GrayText" }}
          >
            <Icon icon="material-symbols:menu" />
          </IconButton>
        </Box>
        
          <Button 
            color="inherit" 
            sx={{ borderRadius: BORDER_RADIUS.default, color: 'GrayText', textTransform: 'inherit', textAlign: 'right' }}
            onClick={handleMenuOpen}
          >
            <Stack flexDirection="row" gap={1}>
              <Stack justifyContent="center">
                <Typography variant="body2" fontSize={13} fontWeight={500}>
                  {formatFirstLastName(userName || '')}
                </Typography>
                {email && <Typography variant="caption">{email}</Typography>}
              </Stack>
              <Avatar sx={{ width: 35, height: 35 }}>{userName ? userName.charAt(0).toUpperCase() : '?'}</Avatar>
            </Stack>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            sx={{
              '.MuiPaper-root': {
                minWidth: 200,
                boxShadow: '0 0 30px #ccc',
                borderRadius: BORDER_RADIUS.medium,
              }
            }}
          >
            <MenuItem onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="material-symbols:logout" fontSize={16} />
              <Typography variant="body2">Sair</Typography>
            </MenuItem>
          </Menu>
      </Toolbar>
    </AppBar>
  );
}
