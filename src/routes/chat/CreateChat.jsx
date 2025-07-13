import { useState } from "react";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate";
import { createChat, getUserById } from "../../constants";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

export default function CreateChat() {
    const { accessToken } = useAuth();
    const customNavigate = useCustomNavigate();

    const [chatName, setChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userIdInput, setUserIdInput] = useState("");
    const [fetchingUser, setFetchingUser] = useState(false);

    const handleBackToChats = () => {
        customNavigate("/chats");
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
    };

    const handleAddUserById = async () => {
        if (!userIdInput.trim()) {
            setError("Введите ID пользователя");
            return;
        }

        if (selectedUsers.find((u) => u.id === userIdInput.trim())) {
            setError("Пользователь уже добавлен");
            return;
        }

        setFetchingUser(true);
        setError(null);

        try {
            const response = await getUserById(userIdInput.trim(), accessToken);
            const userData = response.data;

            // Add user to selected users
            setSelectedUsers((prev) => [
                ...prev,
                {
                    id: userData.id,
                    name: userData.name || userData.email || `User ${userData.id}`,
                    email: userData.email,
                },
            ]);

            setUserIdInput("");
        } catch {
            setError("Пользователь не найден");
        } finally {
            setFetchingUser(false);
        }
    };

    const handleCreateChat = async () => {
        if (!chatName.trim()) {
            setError("Введите название чата");
            return;
        }

        if (selectedUsers.length === 0) {
            setError("Добавьте хотя бы одного пользователя");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const chatData = {
                name: chatName.trim(),
                users: selectedUsers.map((u) => u.id),
            };

            const response = await createChat(chatData, accessToken);

            if (response.data) {
                // Navigate to the newly created chat
                const newChat = response.data;
                customNavigate(`/chats/${newChat.id}/${encodeURIComponent(newChat.name)}`);
            }
        } catch {
            setError("Ошибка создания чата");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = chatName.trim() && selectedUsers.length > 0;

    return (
        <Box
            sx={{
                height: "100%",
                bgcolor: "background.default",
                p: { xs: 1, sm: 2 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 1,
                }}
            >
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBackToChats} sx={{ fontWeight: 600 }}>
                    Назад к чатам
                </Button>
                <Typography
                    variant="h5"
                    sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                    }}
                >
                    Создать чат
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper
                elevation={3}
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                }}
            >
                {/* Chat Name Input */}
                <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}>
                        Название чата
                    </Typography>
                    <TextField
                        fullWidth
                        label="Название чата"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        placeholder="Введите название чата..."
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />
                </Box>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                        <Typography variant="h6" sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}>
                            Участники ({selectedUsers.length})
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {selectedUsers.map((user) => (
                                <Chip
                                    key={user.id}
                                    avatar={<Avatar sx={{ width: 20, height: 20, fontSize: "0.7rem" }}>{user.name.charAt(0)}</Avatar>}
                                    label={user.name}
                                    onDelete={() => handleRemoveUser(user.id)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Add Users */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                        <Typography variant="h6" sx={{ mb: 2, color: "primary.main", fontWeight: 600 }}>
                            Добавить участников
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                fullWidth
                                label="ID пользователя"
                                value={userIdInput}
                                onChange={(e) => setUserIdInput(e.target.value)}
                                placeholder="Введите ID пользователя..."
                                disabled={loading || fetchingUser}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleAddUserById();
                                    }
                                }}
                            />
                            <Button variant="contained" onClick={handleAddUserById} disabled={!userIdInput.trim() || loading || fetchingUser} sx={{ minWidth: "auto", px: 2 }}>
                                {fetchingUser ? <CircularProgress size={20} /> : "Добавить"}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Create Button */}
                <Box sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
                    <Button fullWidth variant="contained" size="large" onClick={handleCreateChat} disabled={!isFormValid || loading} sx={{ fontWeight: 600, py: 1.5 }}>
                        {loading ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CircularProgress size={20} color="inherit" />
                                Создание чата...
                            </Box>
                        ) : (
                            "Создать чат"
                        )}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
