import React from "react";
import { Link, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../AuthContext";
import { withInlineParam } from "../constants";
import Box from "@mui/material/Box";

const navLinks = [
  { label: "Главная", path: "/" },
  { label: "Отзывы Матча", path: "/feedback/match/123123" },
  { label: "Отзывы Турнира", path: "/feedback/tournament/123123" },
  { label: "Отзывы Пользователя (admin)", path: "/admin/feedback/123123" },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar position="static" color="default" elevation={2} sx={{ mb: 3 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          {navLinks.map((link) => (
            <Button
              key={link.path}
              component={Link}
              to={withInlineParam(link.path, location.search)}
              color={location.pathname === link.path ? "primary" : "inherit"}
              variant={location.pathname === link.path ? "contained" : "text"}
              sx={{ fontWeight: 600 }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
        
        <Tooltip title="Профиль" arrow>
          <IconButton
            onClick={handleProfileClick}
            sx={{
              p: 0,
              border: 2,
              borderColor: location.pathname === "/profile" ? "primary.main" : "transparent",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            <Avatar
              src={user?.avatarUrl}
              alt={user?.name || "Профиль"}
              sx={{
                width: 40,
                height: 40,
                bgcolor: user?.avatarUrl ? "transparent" : "primary.main",
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem
            component={Link}
            to={withInlineParam("/profile", location.search)}
            onClick={handleClose}
          >
            Профиль
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Выйти
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
