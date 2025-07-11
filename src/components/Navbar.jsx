import React from "react";
import { Link, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { withInlineParam } from "../constants";

const navLinks = [
  { label: "Главная", path: "/" },
  { label: "Профиль", path: "/profile" },
  { label: "Отзывы Матча", path: "/feedback/match/123123" },
  { label: "Отзывы Турнира", path: "/feedback/tournament/123123" },
  { label: "Отзывы Пользователя (admin)", path: "/admin/feedback/123123" },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <AppBar position="static" color="default" elevation={2} sx={{ mb: 3 }}>
      <Toolbar sx={{ display: "flex", gap: 2 }}>
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
      </Toolbar>
    </AppBar>
  );
}
