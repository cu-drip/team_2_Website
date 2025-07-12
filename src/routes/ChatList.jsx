import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { getChats } from "../constants";
import { useCustomNavigate } from "../components/useCustomNavigate";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Tooltip from "@mui/material/Tooltip";

export default function ChatList() {
    const { accessToken } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const customNavigate = useCustomNavigate();

    useEffect(() => {
        async function fetchChats() {
            setLoading(true);
            setError(null);

            try {
                const response = await getChats(accessToken);
                setChats(response.data || []);
            } catch {
                setError("Ошибка загрузки чатов");
                // Mock data for demo
                setChats([
                    {
                        id: "1",
                        name: "Tournament Chat #1",
                        owner: "user1",
                    },
                    {
                        id: "2",
                        name: "Match Discussion",
                        owner: "user2",
                    },
                    {
                        id: "3",
                        name: "General Chat",
                        owner: "user3",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        }

        if (accessToken) {
            fetchChats();
        }
    }, [accessToken]);

    const handleChatClick = (chat) => {
        customNavigate(`/chat/${chat.id}/${encodeURIComponent(chat.name)}`);
    };

    const handleCreateChat = () => {
        customNavigate("/chat/create");
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    bgcolor: "background.default",
                }}
            >
                <CircularProgress color="primary" size={60} thickness={4} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                bgcolor: "background.default",
                p: { xs: 1, sm: 2 },
                display: "flex",
                height: "100%",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    color: "primary.main",
                    mb: 1,
                    fontWeight: 700,
                    fontSize: { xs: "1.8rem", sm: "2.5rem" },
                    textAlign: "center",
                }}
            >
                Чаты
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                }}
            >
                {chats.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 8,
                            textAlign: "center",
                        }}
                    >
                        <ChatIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            У вас пока нет чатов
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Создайте новый чат или присоединитесь к существующему
                        </Typography>
                        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreateChat} sx={{ fontWeight: 600 }}>
                            Создать чат
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <List sx={{ p: 0 }}>
                            {chats.map((chat) => (
                                <ListItem
                                    key={chat.id}
                                    button
                                    onClick={() => handleChatClick(chat)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        bgcolor: "background.default",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        transition: "all 0.2s ease",
                                        cursor: "pointer",
                                        "&:hover": {
                                            bgcolor: "action.hover",
                                            borderColor: "primary.main",
                                            transform: "translateY(-1px)",
                                            boxShadow: 2,
                                        },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: "primary.main" }}>
                                            <ChatIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                                                {chat.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                ID: {chat.id}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper>

            <Tooltip title="Создать новый чат" placement="left">
                <Fab
                    color="primary"
                    aria-label="add chat"
                    onClick={handleCreateChat}
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        boxShadow: 4,
                    }}
                >
                    <AddIcon />
                </Fab>
            </Tooltip>
        </Box>
    );
}
