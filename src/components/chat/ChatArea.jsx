import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { formatTimestamp, getChatMessages, getChatUsers, getWebSocketUrl } from "../../constants.js";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

export default function ChatArea({ selectedChat }) {
    const { user, accessToken } = useAuth();

    const [messages, setMessages] = useState([]);
    const [chatUsers, setChatUsers] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!selectedChat) {
            setMessages([]);
            setChatUsers([]);
            setLoading(false);
            return;
        }

        async function fetchChatData() {
            setLoading(true);
            setError(null);

            try {
                const [messagesRes, usersRes] = await Promise.all([getChatMessages(selectedChat.id, accessToken), getChatUsers(selectedChat.id, accessToken)]);

                setMessages(messagesRes.data || []);
                setChatUsers(usersRes.data || []);
            } catch {
                setError("Ошибка загрузки данных чата");
                // Mock data for demo
                setMessages([
                    {
                        id: "1",
                        author: "user1",
                        content: "Привет! Как дела?",
                        createdAt: new Date(Date.now() - 300000).toISOString(),
                    },
                    {
                        id: "2",
                        author: "user2",
                        content: "Отлично! Готов к турниру!",
                        createdAt: new Date(Date.now() - 180000).toISOString(),
                    },
                    {
                        id: "3",
                        author: "user1",
                        content: "Отлично! Удачи!",
                        createdAt: new Date(Date.now() - 60000).toISOString(),
                    },
                ]);
                setChatUsers([
                    { id: "user1", name: "Alex" },
                    { id: "user2", name: "Maria" },
                    { id: user?.id, name: user?.name || "You" },
                ]);
            } finally {
                setLoading(false);
            }
        }

        if (accessToken && selectedChat) {
            fetchChatData();
        }
    }, [selectedChat, accessToken, user?.id, user?.name]);

    useEffect(() => {
        // WebSocket connection
        if (accessToken && selectedChat && !wsRef.current) {
            const wsUrl = getWebSocketUrl(selectedChat.id);
            const ws = new WebSocket(wsUrl, [], {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            ws.onopen = () => {
                console.log("WebSocket connected");
                setWsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setMessages((prev) => [...prev, message]);
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected");
                setWsConnected(false);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                setWsConnected(false);
            };

            wsRef.current = ws;
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [selectedChat, accessToken]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !wsRef.current || wsConnected === false) {
            return;
        }

        setSending(true);

        try {
            const messageData = {
                content: newMessage.trim(),
            };

            wsRef.current.send(JSON.stringify(messageData));
            setNewMessage("");
        } catch {
            setError("Ошибка отправки сообщения");
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const getUserName = (userId) => {
        const user = chatUsers.find((u) => u.id === userId);
        return user?.name || userId;
    };

    const isOwnMessage = (message) => {
        return message.author === user?.id;
    };

    if (!selectedChat) {
        return (
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.default",
                }}
            >
                <Box sx={{ textAlign: "center", p: 3 }}>
                    <ChatIcon sx={{ fontSize: 80, color: "text.secondary", mb: 3, opacity: 0.5 }} />
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                        Добро пожаловать в чат
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                        Выберите чат из списка слева или создайте новый для начала общения
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                        Здесь вы можете общаться с участниками турниров и матчей
                    </Typography>
                </Box>
            </Box>
        );
    }

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
                bgcolor: "background.default",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
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
                    {selectedChat.name}
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: wsConnected ? "success.main" : "error.main",
                        }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {wsConnected ? "Подключено" : "Отключено"}
                    </Typography>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Messages Area */}
            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    p: 2,
                }}
            >
                {messages.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            Нет сообщений
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Начните разговор, отправив первое сообщение
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {messages.map((message, index) => (
                            <ListItem
                                key={message.id || index}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: isOwnMessage(message) ? "flex-end" : "flex-start",
                                    p: 0,
                                    mb: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: 1,
                                        maxWidth: "70%",
                                        flexDirection: isOwnMessage(message) ? "row-reverse" : "row",
                                    }}
                                >
                                    {!isOwnMessage(message) && <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem" }}>{getUserName(message.author).charAt(0).toUpperCase()}</Avatar>}
                                    <Box
                                        sx={{
                                            bgcolor: isOwnMessage(message) ? "primary.main" : "background.paper",
                                            color: isOwnMessage(message) ? "white" : "text.primary",
                                            borderRadius: 2,
                                            p: 1.5,
                                            border: isOwnMessage(message) ? "none" : "1px solid",
                                            borderColor: "divider",
                                            maxWidth: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                mb: 0.5,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "0.8rem",
                                                    opacity: 0.8,
                                                }}
                                            >
                                                {getUserName(message.author)}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    opacity: 0.7,
                                                    fontSize: "0.7rem",
                                                }}
                                            >
                                                {formatTimestamp(message.createdAt)}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                wordBreak: "break-word",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {message.content}
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                        <div ref={messagesEndRef} />
                    </List>
                )}
            </Box>

            <Divider />

            {/* Input Area */}
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-end",
                    bgcolor: "background.paper",
                }}
            >
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Введите сообщение..."
                    disabled={!wsConnected}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                        },
                    }}
                />
                <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !wsConnected || sending}
                    sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                            bgcolor: "primary.dark",
                        },
                        "&:disabled": {
                            bgcolor: "action.disabledBackground",
                            color: "action.disabled",
                        },
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
}
