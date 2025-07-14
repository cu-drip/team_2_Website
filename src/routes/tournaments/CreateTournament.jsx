import React, { useState } from "react";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";
import { createTournament } from "../../constants.js";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Divider,
    Chip,
    Stack,
    Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const sportOptions = [
    { value: "FOOTBALL", label: "Футбол", icon: <SportsSoccerIcon /> },
    { value: "TENNIS", label: "Теннис", icon: <SportsTennisIcon /> },
    { value: "BASKETBALL", label: "Баскетбол", icon: <SportsBasketballIcon /> },
];

const tournamentTypeOptions = [
    { value: "solo", label: "Индивидуальный" },
    { value: "team", label: "Командный" },
];

const groupTypeOptions = [
    { value: "olympic", label: "Олимпийская система (на выбывание)" },
    { value: "round_robin", label: "Круговая система" },
    { value: "swiss", label: "Швейцарская система" },
];

export default function CreateTournament() {
    const { accessToken } = useAuth();
    const customNavigate = useCustomNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        sport: "",
        typeTournament: "solo",
        typeGroup: "olympic",
        startTime: "",
        entryCost: "",
        maxParticipants: "",
        matchesNumber: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (field) => (event) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleBackToTournaments = () => {
        customNavigate("/tournaments");
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError("Введите название турнира");
            return false;
        }
        if (!formData.sport) {
            setError("Выберите вид спорта");
            return false;
        }
        if (!formData.startTime) {
            setError("Выберите дату и время начала");
            return false;
        }
        if (formData.maxParticipants && parseInt(formData.maxParticipants) < 2) {
            setError("Минимальное количество участников: 2");
            return false;
        }
        if (formData.entryCost && parseFloat(formData.entryCost) < 0) {
            setError("Стоимость участия не может быть отрицательной");
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const tournamentData = {
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                sport: formData.sport.toLowerCase(),
                typeTournament: formData.typeTournament.toLowerCase(),
                typeGroup: formData.typeGroup.toLowerCase(),
                startTime: formData.startTime,
                entryCost: formData.entryCost ? parseFloat(formData.entryCost) : null,
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
                matchesNumber: formData.matchesNumber ? parseInt(formData.matchesNumber) : null,
            };

            const response = await createTournament(tournamentData, accessToken);

            if (response.data) {
                setSuccess(true);
                // Navigate to the newly created tournament after a short delay
                setTimeout(() => {
                    customNavigate(`/tournaments/${response.data.id}`);
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка создания турнира");
        } finally {
            setLoading(false);
        }
    };

    const getSportIcon = (sport) => {
        const sportOption = sportOptions.find(option => option.value === sport);
        return sportOption ? sportOption.icon : <SportsEsportsIcon />;
    };

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
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleBackToTournaments} 
                    sx={{ fontWeight: 600 }}
                >
                    Назад к турнирам
                </Button>
                <Typography
                    variant="h5"
                    sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                    }}
                >
                    Создать турнир
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Турнир успешно создан! Перенаправление...
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
                    maxHeight: "80vh",
                    overflow: "auto",
                    maxWidth: "1200px",
                    width: "100%",
                    alignSelf: "center",
                }}
            >
                <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, flex: 1 }}>
                    <Grid container spacing={2} direction="column">
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 1, color: "primary.main", fontWeight: 600 }}>
                                Основная информация
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Название турнира"
                                value={formData.title}
                                onChange={handleChange("title")}
                                placeholder="Введите название турнира..."
                                disabled={loading}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required disabled={loading} size="small">
                                <InputLabel>Вид спорта</InputLabel>
                                <Select
                                    value={formData.sport}
                                    onChange={handleChange("sport")}
                                    label="Вид спорта"
                                >
                                    {sportOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                {option.icon}
                                                {option.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Описание"
                                value={formData.description}
                                onChange={handleChange("description")}
                                placeholder="Опишите турнир..."
                                multiline
                                rows={2}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" sx={{ mb: 1, color: "primary.main", fontWeight: 600 }}>
                                Настройки турнира
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth disabled={loading} size="small">
                                <InputLabel>Тип турнира</InputLabel>
                                <Select
                                    value={formData.typeTournament}
                                    onChange={handleChange("typeTournament")}
                                    label="Тип турнира"
                                >
                                    {tournamentTypeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth disabled={loading} size="small">
                                <InputLabel>Система проведения</InputLabel>
                                <Select
                                    value={formData.typeGroup}
                                    onChange={handleChange("typeGroup")}
                                    label="Система проведения"
                                >
                                    {groupTypeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Дата и время начала"
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={handleChange("startTime")}
                                disabled={loading}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Максимальное количество участников"
                                type="number"
                                value={formData.maxParticipants}
                                onChange={handleChange("maxParticipants")}
                                placeholder="Неограниченно"
                                disabled={loading}
                                inputProps={{ min: 2 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Стоимость участия (₽)"
                                type="number"
                                value={formData.entryCost}
                                onChange={handleChange("entryCost")}
                                placeholder="Бесплатно"
                                disabled={loading}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Количество матчей"
                                type="number"
                                value={formData.matchesNumber}
                                onChange={handleChange("matchesNumber")}
                                placeholder="Автоматически"
                                disabled={loading}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>

                        {/* Preview Section */}
                        {formData.title && (
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="h6" sx={{ mb: 1, color: "primary.main", fontWeight: 600 }}>
                                    Предварительный просмотр
                                </Typography>
                                <Paper sx={{ p: 1.5, bgcolor: "background.default" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                                        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                                            {getSportIcon(formData.sport)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {formData.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formData.description || "Описание не указано"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                        {formData.sport && (
                                            <Chip 
                                                icon={getSportIcon(formData.sport)} 
                                                label={sportOptions.find(s => s.value === formData.sport)?.label} 
                                                size="small" 
                                            />
                                        )}
                                        {formData.maxParticipants && (
                                            <Chip 
                                                icon={<PeopleIcon />} 
                                                label={`${formData.maxParticipants} участников`} 
                                                size="small" 
                                            />
                                        )}
                                        {formData.typeGroup && (
                                            <Chip 
                                                icon={<EventIcon />} 
                                                label={groupTypeOptions.find(g => g.value === formData.typeGroup)?.label} 
                                                size="small" 
                                            />
                                        )}
                                        {formData.entryCost ? (
                                            <Chip 
                                                icon={<AttachMoneyIcon />} 
                                                label={`${formData.entryCost}₽`} 
                                                size="small" 
                                            />
                                        ) : (
                                            <Chip 
                                                icon={<AttachMoneyIcon />} 
                                                label="Бесплатно" 
                                                size="small" 
                                            />
                                        )}
                                        {formData.startTime && (
                                            <Chip 
                                                icon={<CalendarTodayIcon />} 
                                                label={new Date(formData.startTime).toLocaleString()} 
                                                size="small" 
                                            />
                                        )}
                                    </Stack>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>

                    {/* Submit Button */}
                    <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleBackToTournaments}
                            disabled={loading}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !formData.title || !formData.sport || !formData.startTime}
                            sx={{ 
                                flex: 1, 
                                fontWeight: 600, 
                                py: 1,
                                minHeight: 40
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CircularProgress size={16} color="inherit" />
                                    Создание турнира...
                                </Box>
                            ) : (
                                "Создать турнир"
                            )}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
} 