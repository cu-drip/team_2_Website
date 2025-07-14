import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";

export default function FeedbackEntry() {
    const [type, setType] = useState("match");
    const [id, setId] = useState("");
    const [error, setError] = useState("");
    const navigate = useCustomNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!id.trim()) {
            setError("Введите ID");
            return;
        }
        setError("");
        navigate(`/feedback/${type}/${id.trim()}`);
    };

    const handleTypeChange = (_, newType) => {
        if (newType) setType(newType);
    };

    return (
        <Box sx={{ height: "100%", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
            <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 400, width: "100%", bgcolor: "background.paper", boxShadow: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main", mb: 3, textAlign: "center" }}>
                    Открыть отзывы
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <ToggleButtonGroup value={type} exclusive onChange={handleTypeChange} fullWidth color="primary" size="small">
                        <ToggleButton value="match" sx={{ fontWeight: 600 }}>
                            Матч
                        </ToggleButton>
                        <ToggleButton value="tournament" sx={{ fontWeight: 600 }}>
                            Турнир
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <TextField label="ID" value={id} onChange={(e) => setId(e.target.value)} fullWidth required size="small" />
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
