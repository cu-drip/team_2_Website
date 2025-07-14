import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { getChats } from "../../constants.js";
import Box from "@mui/material/Box";
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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export default function ChatListSidebar({ selectedChatId, onChatSelect, onCreateChat, onChatsLoaded }) {
    const { accessToken } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchChats() {
            setLoading(true);
            setError(null);

            try {
                const response = await getChats(accessToken);
                response.data.forEach(() => {});
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
                if (onChatsLoaded) {
                    onChatsLoaded(chats);
                }
            }
        }

        if (accessToken) {
            fetchChats();
        }
    }, [accessToken]);

    const handleChatClick = (chat) => {
        onChatSelect(chat);
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
                <CircularProgress color="primary" size={40} thickness={4} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                    }}
                >
                    Чаты
                </Typography>
                <Tooltip title="Создать новый чат" placement="top">
                    <IconButton
                        color="primary"
                        onClick={onCreateChat}
                        sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            "&:hover": {
                                bgcolor: "primary.dark",
                            },
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Chat List */}
            <Box sx={{ flex: 1, overflow: "hidden" }}>
                {chats.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 4,
                            px: 2,
                            textAlign: "center",
                            height: "100%",
                        }}
                    >
                        <ChatIcon sx={{ fontSize: 40, color: "text.secondary", mb: 2 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            У вас пока нет чатов
                        </Typography>
                        <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={onCreateChat} sx={{ fontWeight: 600 }}>
                            Создать чат
                        </Button>
                    </Box>
                ) : (
                    <List sx={{ p: 0, height: "100%", overflow: "auto" }}>
                        {chats.map((chat) => (
                            <ListItem
                                key={chat.id}
                                button
                                onClick={() => handleChatClick(chat)}
                                selected={selectedChatId === chat.id}
                                sx={{
                                    borderRadius: 0,
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    "&:hover": {
                                        bgcolor: "action.hover",
                                    },
                                    "&.Mui-selected": {
                                        bgcolor: "primary.main",
                                        color: "white",
                                        "&:hover": {
                                            bgcolor: "primary.dark",
                                        },
                                        "& .MuiListItemText-primary": {
                                            color: "white",
                                        },
                                        "& .MuiListItemText-secondary": {
                                            color: "rgba(255, 255, 255, 0.7)",
                                        },
                                    },
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: selectedChatId === chat.id ? "white" : "primary.main", color: selectedChatId === chat.id ? "primary.main" : "white" }}>
                                        <ChatIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                            {chat.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            ID: {chat.id}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
}
