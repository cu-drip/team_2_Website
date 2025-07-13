import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    Typography,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PeopleIcon from "@mui/icons-material/People";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { formatTimestamp, getBracket, getTourMatches, getTournament, getTournamentParticipants, getUserById } from "../../constants.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";

function TabPanel({ children, value, index }) {
    return (
        <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
            {value === index && <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>{children}</Box>}
        </Box>
    );
}

export default function TournamentDetails() {
    const { id } = useParams();
    const { accessToken } = useAuth();
    const navigate = useCustomNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [participants, setParticipants] = useState([]); // may contain ids or objects
    const [participantInfos, setParticipantInfos] = useState({});
    const [matches, setMatches] = useState([]);
    const [bracket, setBracket] = useState(null);
    const [bracketEl, setBracketEl] = useState(null);
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
                const partArray = Array.isArray(partRes?.data) ? partRes.data : [];
                setParticipants(partArray);
                // fetch participant infos if array contains id strings
                const idsToFetch = partArray.filter((p) => typeof p === "string").slice(0, 20); // limit
                const infos = {};
                await Promise.all(
                    idsToFetch.map(async (pid) => {
                        try {
                            const res = await getUserById(pid, accessToken);
                            infos[pid] = res.data;
                        } catch {
                            // ignore
                        }
                    })
                );
                setParticipantInfos(infos);
                setMatches(Array.isArray(matchRes?.data) ? matchRes.data : []);
                setBracket(bracketRes?.data || null);
            } catch {
                if (!cancelled) {
                    setError("Ошибка загрузки данных, показываю демо");
                    setTournament({
                        title: "Demo Tournament",
                        sport: "FOOTBALL",
                        description: "Тестовый турнир",
                        startTime: new Date().toISOString(),
                        entryCost: 0,
                    });

                    // Mock participants (ids only per schema)
                    setParticipants(["11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]);

                    setParticipantInfos({
                        "11111111-1111-1111-1111-111111111111": { name: "Player One" },
                        "22222222-2222-2222-2222-222222222222": { name: "Player Two" },
                        "33333333-3333-3333-3333-333333333333": { name: "Player Three" },
                        "44444444-4444-4444-4444-444444444444": { name: "Player Four" },
                    });

                    // Mock matches in new schema
                    setMatches([
                        {
                            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                            plannedStartTime: new Date().toISOString(),
                            plannedEndTime: new Date(Date.now() + 3600000).toISOString(),
                            participants: [
                                { id: "11111111-1111-1111-1111-111111111111", score: 2 },
                                { id: "22222222-2222-2222-2222-222222222222", score: 1 },
                            ],
                            winner: "11111111-1111-1111-1111-111111111111",
                            status: "finished",
                            parentMatches: [],
                        },
                        {
                            id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                            plannedStartTime: new Date().toISOString(),
                            plannedEndTime: new Date(Date.now() + 3600000).toISOString(),
                            participants: [
                                { id: "33333333-3333-3333-3333-333333333333", score: 0 },
                                { id: "44444444-4444-4444-4444-444444444444", score: 2 },
                            ],
                            winner: "44444444-4444-4444-4444-444444444444",
                            status: "finished",
                            parentMatches: [],
                        },
                        {
                            id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
                            plannedStartTime: new Date().toISOString(),
                            plannedEndTime: new Date(Date.now() + 3600000).toISOString(),
                            participants: [
                                { id: "11111111-1111-1111-1111-111111111111", score: null },
                                { id: "44444444-4444-4444-4444-444444444444", score: null },
                            ],
                            winner: null,
                            status: "prepared",
                            parentMatches: ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"],
                        },
                    ]);

                    // Mock bracket
                    setBracket({
                        typeTournament: "solo",
                        typeGroup: "OLYMPIC",
                        matches: ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "cccccccc-cccc-cccc-cccc-cccccccccccc"],
                    });
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

    useEffect(() => {
        const prepareBracket = () => {
            if (!bracket) return null;
            if (bracket.typeGroup !== "OLYMPIC") return null;

            let previousMatches = matches.filter((m) => m.parentMatches.length === 0);
            let currentMatches = matches.filter((m) => m.parentMatches.length !== 0);

            let depth = 0;
            const rounds = [];

            const round = [];
            previousMatches.forEach((m) => {
                round.push(m);
            });
            rounds.push(round);

            while (currentMatches.length > 0 && depth++ < 10) {
                const round = [];
                currentMatches.forEach((m) => {
                    if (previousMatches.some((pm) => m.parentMatches.includes(pm.id))) {
                        round.push(m);
                    }
                });
                rounds.push(round);

                const prev = previousMatches;
                previousMatches = currentMatches;
                currentMatches = currentMatches.filter((m) => !prev.some((pm) => m.parentMatches.includes(pm.id)));
            }

            return rounds;
        };

        const rounds = prepareBracket();
        if (!rounds) return;

        setBracketEl(
            <>
                {rounds.map((round) => {
                    return (
                        <>
                            <Box key={round.id} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly", bgcolor: "background.default" }}>
                                {round.map((m) => {
                                    return (
                                        <Box
                                            key={m.id}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                width: "50px",
                                                bgcolor: "background.default",
                                                border: "1px solid red",
                                                borderRadius: 1,
                                                height: "50px",
                                            }}
                                        ></Box>
                                    );
                                })}
                            </Box>

                            <Box sx={{ bgcolor: "red", height: "1px", width: "50px" }}></Box>
                        </>
                    );
                })}
            </>
        );
    }, [id, accessToken, bracket, matches]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!tournament) {
        return (
            <Alert severity="error" sx={{ m: 4 }}>
                Турнир не найден
            </Alert>
        );
    }

    const getParticipantLabel = (pIdOrObj) => {
        if (typeof pIdOrObj === "string") {
            return participantInfos[pIdOrObj]?.name || pIdOrObj;
        }
        return pIdOrObj.name || pIdOrObj.id;
    };

    const renderScore = (match) => {
        if (!Array.isArray(match.participants) || match.participants.length < 2) return "-";
        const sA = match.participants[0].score ?? "-";
        const sB = match.participants[1].score ?? "-";
        return `${sA} - ${sB}`;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button variant="outlined" onClick={() => navigate("/tournaments")} sx={{ mb: 3, fontWeight: 600 }}>
                Назад
            </Button>

            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                {tournament.title}
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ mb: 4, boxShadow: 4, borderRadius: 2 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <SportsSoccerIcon fontSize="large" color="primary" />
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Информация
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {tournament.description || "—"}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {[
                            ["Вид спорта", tournament.sport],
                            ["Начало", formatTimestamp(tournament.startTime)],
                            ["Участников", participants.length],
                            ["Стоимость", tournament.entryCost ? `${tournament.entryCost}₽` : "—"],
                        ].map(([label, value]) => (
                            <Grid key={label} item xs={6} md={3}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {label}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {value ?? "—"}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
                <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)} variant="fullWidth" indicatorColor="primary">
                    <Tab icon={<PeopleIcon />} label={`Участники (${participants.length})`} />
                    <Tab icon={<TableChartIcon />} label={`Матчи (${matches.length})`} />
                    <Tab icon={<FormatListNumberedIcon />} label="Сетка" />
                </Tabs>

                <TabPanel value={tab} index={0}>
                    {participants.length === 0 ? (
                        <Typography color="text.secondary">Пока нет участников</Typography>
                    ) : (
                        <List sx={{ width: "100%" }}>
                            {participants.map((p, idx) => {
                                const id = typeof p === "string" ? p : p.id;
                                const label = getParticipantLabel(p);
                                return (
                                    <ListItem key={id || idx} sx={{ mb: 1, borderRadius: 1, boxShadow: 1 }}>
                                        <ListItemAvatar>
                                            <Avatar>{label[0]?.toUpperCase() || "U"}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={label} secondary={id} />
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </TabPanel>

                <TabPanel value={tab} index={1}>
                    {matches.length === 0 ? (
                        <Typography color="text.secondary">Пока нет матчей</Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>A</TableCell>
                                    <TableCell>B</TableCell>
                                    <TableCell align="center">Счёт</TableCell>
                                    <TableCell align="center">Статус</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {matches.map((m) => (
                                    <TableRow key={m.id} hover>
                                        <TableCell>{m.id}</TableCell>
                                        <TableCell>{getParticipantLabel(m.participants?.[0]?.id || "—")}</TableCell>
                                        <TableCell>{getParticipantLabel(m.participants?.[1]?.id || "—")}</TableCell>
                                        <TableCell align="center">{renderScore(m)}</TableCell>
                                        <TableCell align="center">{m.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TabPanel>

                <TabPanel value={tab} index={2}>
                    {bracket ? (
                        <Box sx={{ display: "flex", justifyContent: "space-evenly", width: "100%", height: "100%", bgcolor: "background.default" }}>{bracketEl}</Box>
                    ) : (
                        <Typography color="text.secondary">Сетка недоступна</Typography>
                    )}
                </TabPanel>
            </Card>
        </Container>
    );
}
