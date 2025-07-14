import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Stack,
    Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";
import { formatTimestamp, getTourMatches, updateTourMatch, getUserById } from "../../constants.js";

const matchStatuses = [
    { value: "prepared", label: "Подготовлен" },
    { value: "in_progress", label: "В процессе" },
    { value: "finished", label: "Завершен" },
    { value: "cancelled", label: "Отменен" },
];

export default function MatchAdmin() {
    const { accessToken, user } = useAuth();
    const navigate = useCustomNavigate();
    const [tournamentId, setTournamentId] = useState("");
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingMatch, setEditingMatch] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [participantInfos, setParticipantInfos] = useState({});
    const [searchParams] = useSearchParams();

    // Pre-fill and auto-load tournament ID from URL query parameters
    useEffect(() => {
        const initialTournamentId = searchParams.get("tournamentId");
        if (initialTournamentId && !tournamentId) {
            setTournamentId(initialTournamentId);
            // Auto-load matches if we have access token
            if (accessToken) {
                setLoading(true);
                setError(null);
                loadMatches(initialTournamentId);
            }
        }
    }, [searchParams, accessToken]);

    // Separate function to load matches
    const loadMatches = async (tournamentIdToLoad) => {
        try {
            const response = await getTourMatches(tournamentIdToLoad, accessToken);
            const matchesData = Array.isArray(response?.data) ? response.data : [];
            setMatches(matchesData);

            // Fetch participant infos for all matches
            const allParticipantIds = new Set();
            matchesData.forEach(match => {
                if (Array.isArray(match.participants)) {
                    match.participants.forEach(p => {
                        if (p.id) allParticipantIds.add(p.id);
                    });
                }
            });

            const infos = {};
            await Promise.all(
                Array.from(allParticipantIds).map(async (pid) => {
                    try {
                        const res = await getUserById(pid, accessToken);
                        infos[pid] = res.data;
                    } catch {
                        infos[pid] = { name: `User ${pid}` };
                    }
                })
            );
            setParticipantInfos(infos);
        } catch {
            setError("Ошибка загрузки матчей турнира");
            // Demo data
            setMatches([
                {
                    id: "match-1",
                    plannedStartTime: new Date().toISOString(),
                    plannedEndTime: new Date(Date.now() + 3600000).toISOString(),
                    participants: [
                        { id: "user-1", score: 2 },
                        { id: "user-2", score: 1 }
                    ],
                    winner: "user-1",
                    status: "finished",
                    parentMatches: []
                },
                {
                    id: "match-2",
                    plannedStartTime: new Date(Date.now() + 7200000).toISOString(),
                    plannedEndTime: new Date(Date.now() + 10800000).toISOString(),
                    participants: [
                        { id: "user-3", score: null },
                        { id: "user-4", score: null }
                    ],
                    winner: null,
                    status: "prepared",
                    parentMatches: []
                }
            ]);
            setParticipantInfos({
                "user-1": { name: "Player 1" },
                "user-2": { name: "Player 2" },
                "user-3": { name: "Player 3" },
                "user-4": { name: "Player 4" }
            });
        } finally {
            setLoading(false);
        }
    };

    // Check if user is admin
    if (!user?.admin) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
                <Typography color="error" variant="h6">
                    Доступ только для администраторов
                </Typography>
            </Box>
        );
    }

    const handleTournamentIdSubmit = async (e) => {
        e.preventDefault();
        if (!tournamentId.trim()) {
            setError("Введите ID турнира");
            return;
        }

        setLoading(true);
        setError(null);
        await loadMatches(tournamentId.trim());
    };

    const handleEditMatch = (match) => {
        // Format datetime for HTML input (YYYY-MM-DDTHH:mm)
        const formatDateTimeForInput = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
        };

        setEditingMatch({
            id: match.id,
            plannedStartTime: formatDateTimeForInput(match.plannedStartTime),
            plannedEndTime: formatDateTimeForInput(match.plannedEndTime),
            status: match.status || "prepared",
            participants: match.participants ? [...match.participants] : [],
            winner: match.winner || null
        });
        setEditDialogOpen(true);
    };

    const handleSaveMatch = async () => {
        if (!editingMatch) return;

        setSaving(true);
        setError(null);

        try {
            // Only send changed fields
            const updateData = {};
            
            // Convert datetime input back to ISO format for saving
            const convertToISO = (dateTimeString) => {
                if (!dateTimeString) return null;
                return new Date(dateTimeString).toISOString();
            };

            // Helper function to format original datetime for comparison
            const formatOriginalForComparison = (dateString) => {
                if (!dateString) return "";
                return new Date(dateString).toISOString().slice(0, 16);
            };

            const originalMatch = matches.find(m => m.id === editingMatch.id);
            
            if (editingMatch.plannedStartTime !== formatOriginalForComparison(originalMatch?.plannedStartTime)) {
                updateData.plannedStartTime = convertToISO(editingMatch.plannedStartTime);
            }
            
            if (editingMatch.plannedEndTime !== formatOriginalForComparison(originalMatch?.plannedEndTime)) {
                updateData.plannedEndTime = convertToISO(editingMatch.plannedEndTime);
            }
            
            if (editingMatch.status !== matches.find(m => m.id === editingMatch.id)?.status) {
                updateData.status = editingMatch.status;
            }
            
            if (editingMatch.winner !== matches.find(m => m.id === editingMatch.id)?.winner) {
                updateData.winner = editingMatch.winner;
            }

            // Check if participants changed
            const participantsChanged = JSON.stringify(editingMatch.participants) !== JSON.stringify(originalMatch?.participants);
            if (participantsChanged) {
                updateData.participants = editingMatch.participants;
            }

            // Add match ID to update data
            updateData.id = editingMatch.id;

            await updateTourMatch(tournamentId, editingMatch.id, updateData, accessToken);
            
            // Update local state
            setMatches(prev => prev.map(match => 
                match.id === editingMatch.id 
                    ? { ...match, ...updateData }
                    : match
            ));
            
            setEditDialogOpen(false);
            setEditingMatch(null);
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка обновления матча");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditDialogOpen(false);
        setEditingMatch(null);
    };

    const handleParticipantScoreChange = (participantIndex, newScore) => {
        if (!editingMatch) return;
        
        const updatedParticipants = [...editingMatch.participants];
        updatedParticipants[participantIndex] = {
            ...updatedParticipants[participantIndex],
            score: newScore === "" ? null : parseInt(newScore)
        };
        
        setEditingMatch({
            ...editingMatch,
            participants: updatedParticipants
        });
    };

    const handleParticipantIdChange = (participantIndex, newId) => {
        if (!editingMatch) return;
        
        const updatedParticipants = [...editingMatch.participants];
        updatedParticipants[participantIndex] = {
            ...updatedParticipants[participantIndex],
            id: newId
        };
        
        setEditingMatch({
            ...editingMatch,
            participants: updatedParticipants
        });
    };

    const getParticipantName = (participantId) => {
        return participantInfos[participantId]?.name || participantId;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "finished": return "success";
            case "in_progress": return "warning";
            case "cancelled": return "error";
            default: return "default";
        }
    };

    const getStatusLabel = (status) => {
        const statusObj = matchStatuses.find(s => s.value === status);
        return statusObj ? statusObj.label : status;
    };

    return (
        <Box sx={{ height: "100%", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Управление матчами
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/admin")}
                    sx={{ fontWeight: 600 }}
                >
                    Назад к админ панели
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Tournament ID Input */}
            <Card sx={{ mb: 4, boxShadow: 4, borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Выберите турнир
                    </Typography>
                    <Box component="form" onSubmit={handleTournamentIdSubmit} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <TextField
                            label="ID турнира"
                            value={tournamentId}
                            onChange={(e) => setTournamentId(e.target.value)}
                            placeholder="Введите ID турнира..."
                            size="small"
                            sx={{ minWidth: 200 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !tournamentId.trim()}
                            sx={{ fontWeight: 600 }}
                        >
                            {loading ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CircularProgress size={16} />
                                    Загрузка...
                                </Box>
                            ) : (
                                "Загрузить матчи"
                            )}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Matches List */}
            {matches.length > 0 && (
                <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Матчи турнира ({matches.length})
                        </Typography>
                        
                        <Box sx={{ overflowX: "auto" }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Участники</TableCell>
                                        <TableCell align="center">Счёт</TableCell>
                                        <TableCell align="center">Начало</TableCell>
                                        <TableCell align="center">Окончание</TableCell>
                                        <TableCell align="center">Статус</TableCell>
                                        <TableCell align="center">Победитель</TableCell>
                                        <TableCell align="center">Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {matches.map((match) => (
                                        <TableRow key={match.id} hover>
                                            <TableCell>{match.id}</TableCell>
                                            <TableCell>
                                                <Stack direction="column" spacing={0.5}>
                                                    {match.participants?.map((p, idx) => (
                                                        <Typography key={idx} variant="body2">
                                                            {getParticipantName(p.id)}
                                                        </Typography>
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                {match.participants?.length >= 2 
                                                    ? `${match.participants[0]?.score ?? "-"} : ${match.participants[1]?.score ?? "-"}`
                                                    : "-"
                                                }
                                            </TableCell>
                                            <TableCell align="center">
                                                {match.plannedStartTime ? formatTimestamp(match.plannedStartTime) : "—"}
                                            </TableCell>
                                            <TableCell align="center">
                                                {match.plannedEndTime ? formatTimestamp(match.plannedEndTime) : "—"}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={getStatusLabel(match.status)} 
                                                    color={getStatusColor(match.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {match.winner ? getParticipantName(match.winner) : "—"}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditMatch(match)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Edit Match Dialog */}
            <Dialog 
                open={editDialogOpen} 
                onClose={handleCancelEdit}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Редактировать матч {editingMatch?.id}
                </DialogTitle>
                <DialogContent>
                    {editingMatch && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Время начала"
                                        type="datetime-local"
                                        value={editingMatch.plannedStartTime}
                                        onChange={(e) => setEditingMatch({
                                            ...editingMatch,
                                            plannedStartTime: e.target.value
                                        })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Время окончания"
                                        type="datetime-local"
                                        value={editingMatch.plannedEndTime}
                                        onChange={(e) => setEditingMatch({
                                            ...editingMatch,
                                            plannedEndTime: e.target.value
                                        })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Статус</InputLabel>
                                        <Select
                                            value={editingMatch.status}
                                            onChange={(e) => setEditingMatch({
                                                ...editingMatch,
                                                status: e.target.value
                                            })}
                                            label="Статус"
                                        >
                                            {matchStatuses.map((status) => (
                                                <MenuItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Победитель</InputLabel>
                                        <Select
                                            value={editingMatch.winner || ""}
                                            onChange={(e) => setEditingMatch({
                                                ...editingMatch,
                                                winner: e.target.value === "" ? null : e.target.value
                                            })}
                                            label="Победитель"
                                            sx={{ minWidth: "120px" }}
                                        >
                                            <MenuItem value="">Нет победителя</MenuItem>
                                            {editingMatch.participants?.map((p, idx) => (
                                                <MenuItem key={idx} value={p.id}>
                                                    {getParticipantName(p.id)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Участники
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {editingMatch.participants?.map((participant, idx) => (
                                            <Grid item xs={12} md={6} key={idx}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                            Участник {idx + 1}
                                                        </Typography>
                                                        <Grid container spacing={1}>
                                                            <Grid item xs={8}>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    label="ID участника"
                                                                    value={participant.id}
                                                                    onChange={(e) => handleParticipantIdChange(idx, e.target.value)}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <TextField
                                                                    fullWidth
                                                                    size="small"
                                                                    label="Счёт"
                                                                    type="number"
                                                                    value={participant.score || ""}
                                                                    onChange={(e) => handleParticipantScoreChange(idx, e.target.value)}
                                                                    inputProps={{ min: 0 }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                                            {getParticipantName(participant.id)}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleSaveMatch} 
                        variant="contained" 
                        startIcon={<SaveIcon />}
                        disabled={saving}
                    >
                        {saving ? "Сохранение..." : "Сохранить"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 