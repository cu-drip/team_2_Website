import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { getTournament, getTournamentParticipants, getTourMatches, getBracket, formatTimestamp } from "../../constants.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";

export default function TournamentDetails() {
    const { id } = useParams();
    const { accessToken } = useAuth();
    const customNavigate = useCustomNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [matches, setMatches] = useState([]);
    const [bracket, setBracket] = useState(null);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const [tourRes, partRes, matchRes, bracketRes] = await Promise.all([
                    getTournament(id, accessToken).catch(() => null),
                    getTournamentParticipants(id, accessToken).catch(() => null),
                    getTourMatches(id, accessToken).catch(() => null),
                    getBracket(id, accessToken).catch(() => null),
                ]);

                if (cancelled) return;
                if (!tourRes) throw new Error("tournament");

                setTournament(tourRes.data);
                setParticipants(Array.isArray(partRes?.data) ? partRes.data : []);
                setMatches(Array.isArray(matchRes?.data) ? matchRes.data : []);
                setBracket(bracketRes?.data || null);
            } catch {
                if (!cancelled) {
                    setError("Ошибка загрузки данных турнира, показаны тестовые данные");
                    // minimal mock
                    setTournament({
                        title: "Demo Tournament",
                        sport: "FOOTBALL",
                        description: "Тестовый турнир",
                        startTime: new Date().toISOString(),
                    });
                    setParticipants([]);
                    setMatches([]);
                    setBracket(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        if (accessToken) fetchData();
        return () => {
            cancelled = true;
        };
    }, [id, accessToken]);

    const handleTabChange = (_e, newValue) => setTab(newValue);

    if (loading) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!tournament) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Турнир не найден
            </Alert>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
            <Button variant="outlined" sx={{ mb: 2, fontWeight: 600 }} onClick={() => customNavigate("/tournaments")}>
                Назад к списку
            </Button>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
                {tournament.title}
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Paper sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: 3 }}>
                <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="tournament tabs">
                    <Tab label="Инфо" />
                    <Tab label={`Участники (${participants.length})`} />
                    <Tab label={`Матчи (${matches.length})`} />
                    <Tab label="Сетка" />
                </Tabs>

                {/* Info */}
                {tab === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Описание
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {tournament.description || "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Вид спорта: {tournament.sport || "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Тип турнира: {tournament.typeTournament || "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Формат группы: {tournament.typeGroup || "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Кол-во матчей: {tournament.matchesNumber ?? "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Начало: {formatTimestamp(tournament.startTime)}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Стоимость участия: {tournament.entryCost != null ? `${tournament.entryCost}₽` : "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Максимум участников: {tournament.maxParticipants ?? "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Место: {tournament.place || "-"}
                        </Typography>
                        <Typography variant="body2">Статус: {tournament.state || "-"}</Typography>
                    </Box>
                )}

                {/* Participants */}
                {tab === 1 && (
                    <Box sx={{ p: 3 }}>
                        {participants.length === 0 ? (
                            <Typography color="text.secondary">Пока нет участников</Typography>
                        ) : (
                            <List>
                                {participants.map((p) => (
                                    <ListItem key={p.id} disablePadding>
                                        <Avatar sx={{ mr: 2 }}>{p.name ? p.name.charAt(0).toUpperCase() : "U"}</Avatar>
                                        <ListItemText primary={p.name || p.id} secondary={p.email || p.id} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                )}

                {/* Matches */}
                {tab === 2 && (
                    <Box sx={{ p: 3, overflowX: "auto" }}>
                        {matches.length === 0 ? (
                            <Typography color="text.secondary">Пока нет матчей</Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Участник A</TableCell>
                                        <TableCell>Участник B</TableCell>
                                        <TableCell>Счёт</TableCell>
                                        <TableCell>Статус</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {matches.map((m) => (
                                        <TableRow key={m.id} hover>
                                            <TableCell>{m.id}</TableCell>
                                            <TableCell>{m.participantA ?? "-"}</TableCell>
                                            <TableCell>{m.participantB ?? "-"}</TableCell>
                                            <TableCell>{m.score ?? "-"}</TableCell>
                                            <TableCell>{m.state ?? "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Box>
                )}

                {/* Bracket */}
                {tab === 3 && (
                    <Box sx={{ p: 3 }}>
                        {bracket ? <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(bracket, null, 2)}</pre> : <Typography color="text.secondary">Сетка недоступна</Typography>}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
