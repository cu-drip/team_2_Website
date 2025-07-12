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
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../AuthContext";
import { withInlineParam } from "../constants";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

const navLinks = [
    { label: "Главная", path: "/" },
    { label: "Чаты", path: "/chats" },
    { label: "Отзывы Матча", path: "/feedback/match/123123" },
    { label: "Отзывы Турнира", path: "/feedback/tournament/123123" },
    { label: "Отзывы Пользователя (admin)", path: "/admin/feedback/123123" },
];

export default function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClick = (event) => {
        setMobileMenuAnchor(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchor(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        handleMobileMenuClose();
    };

    return (
        <AppBar
            position="sticky"
            color="default"
            elevation={0}
            sx={{
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: "rgba(22, 27, 34, 0.8)",
                backdropFilter: "blur(6px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* Mobile Menu Button */}
                {isMobile && (
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMobileMenuClick} sx={{ mr: 1 }}>
                        <MenuIcon />
                    </IconButton>
                )}

                {/* Desktop Navigation Links */}
                {!isMobile && (
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
                )}

                {isMobile && (
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
                        Drip Competition
                    </Typography>
                )}

                {/* Profile Avatar */}
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

                {/* Profile Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                >
                    <MenuItem component={Link} to={withInlineParam("/profile", location.search)} onClick={handleClose}>
                        Профиль
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Выйти
                    </MenuItem>
                </Menu>

                {/* Mobile Navigation Menu */}
                <Menu
                    anchorEl={mobileMenuAnchor}
                    open={Boolean(mobileMenuAnchor)}
                    onClose={handleMobileMenuClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                    sx={{
                        "& .MuiPaper-root": {
                            minWidth: 200,
                        },
                    }}
                >
                    {navLinks.map((link) => (
                        <MenuItem
                            key={link.path}
                            component={Link}
                            to={withInlineParam(link.path, location.search)}
                            onClick={handleMobileMenuClose}
                            selected={location.pathname === link.path}
                            sx={{
                                color: location.pathname === link.path ? "primary.main" : "inherit",
                                fontWeight: location.pathname === link.path ? 600 : 400,
                            }}
                        >
                            {link.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
