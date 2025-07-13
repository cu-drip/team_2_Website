import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useAuth } from "../contexts/auth/AuthContext.js";
import { getTournaments } from "../constants.js";
import { useCustomNavigate } from "../contexts/navigation/useCustomNavigate.js";

export default function Tournaments() {
    const { accessToken } = useAuth();
    const customNavigate = useCustomNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const res = await getTournaments(accessToken);
                // assume backend returns array
                setTournaments(Array.isArray(res.data) ? res.data : []);
            } catch {
                setError("Ошибка загрузки турниров, показаны тестовые данные");
                // mock tournaments
                setTournaments([
                    {
                        id: "123e4567-e89b-12d3-a456-426614174001",
                        title: "City Football Championship",
                        description: "Ежегодный турнир среди любительских команд",
                        sport: "FOOTBALL",
                        typeTournament: "team",
                        typeGroup: "olympic",
                        matchesNumber: 16,
                        startTime: "2024-05-10T14:00:00Z",
                        createdAt: "2024-04-20T10:00:00Z",
                        entryCost: 1000.0,
                        maxParticipants: 32,
                        registrationDeadline: "2024-05-05T23:59:59Z",
                        place: "City Stadium",
                        organizedId: "123e4567-e89b-12d3-a456-426614174002",
                        state: "OPEN",
                    },
                    {
                        id: "123e4567-e89b-12d3-a456-426614174003",
                        title: "Tennis Masters Cup",
                        description: "Престижный одиночный теннисный турнир",
                        sport: "TENNIS",
                        typeTournament: "solo",
                        typeGroup: "round_robin",
                        matchesNumber: 8,
                        startTime: "2024-03-01T12:00:00Z",
                        createdAt: "2024-02-01T09:00:00Z",
                        entryCost: 500.0,
                        maxParticipants: 8,
                        registrationDeadline: "2024-02-25T23:59:59Z",
                        place: "Central Court",
                        organizedId: "123e4567-e89b-12d3-a456-426614174004",
                        state: "FINISHED",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        }
        if (accessToken) fetchData();
    }, [accessToken]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, mb: 3, textAlign: "center" }}>
                Все турниры
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 6 }}>
                    <CircularProgress />
                </Box>
            ) : tournaments.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: "center" }}>
                    Нет доступных турниров
                </Typography>
            ) : (
                <Grid container spacing={3} justifyContent="center">
                    {tournaments.map((tour) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={tour.id}>
                            <Card
                                onClick={() => customNavigate(`/tournaments/${tour.id}`)}
                                sx={{
                                    cursor: "pointer",
                                    bgcolor: "background.paper",
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    "&:hover": { boxShadow: 6 },
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Avatar sx={{ bgcolor: "primary.main" }}>
                                            <SportsEsportsIcon />
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                                            {tour.title}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Sport: {tour.sport || "-"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Tournament Type: {tour.typeTournament || "-"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Group Format: {tour.typeGroup || "-"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Matches: {tour.matchesNumber ?? "-"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Starts: {tour.startTime?.slice(0, 10) || "-"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Max Participants: {tour.maxParticipants ?? "-"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Entry Cost: {tour.entryCost != null ? `${tour.entryCost}₽` : "-"}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
