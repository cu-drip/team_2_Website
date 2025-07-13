import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";
import { useAuth } from "../../contexts/auth/AuthContext.js";

export default function AdminFeedbackEntry() {
    const { user } = useAuth();
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");
    const navigate = useCustomNavigate();

    if (!user?.admin) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
                <Typography color="error" variant="h6">
                    Доступ только для администраторов
                </Typography>
            </Box>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userId.trim()) {
            setError("Введите ID пользователя");
            return;
        }
        setError("");
        navigate(`/admin/feedback/${userId.trim()}`);
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
            <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 400, width: "100%", bgcolor: "background.paper", boxShadow: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main", mb: 3, textAlign: "center" }}>
                    Просмотреть отзывы пользователя
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField label="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} fullWidth required size="small" />
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    <Button type="submit" variant="contained" fullWidth sx={{ fontWeight: 600 }}>
                        Перейти к отзывам
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
