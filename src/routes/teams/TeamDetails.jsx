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
    Chip,
    Stack,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import {
    formatTimestamp,
    getTeam,
    getTeamParticipants,
    getUserById,
    addTeamParticipant,
    removeTeamParticipant,
} from "../../constants.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";

function TabPanel({ children, value, index }) {
    return (
        <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
            {value === index && (
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    {children}
                </Box>
            )}
        </Box>
    );
}

export default function TeamDetails() {
    const { id } = useParams();
    const { accessToken, user } = useAuth();
    const navigate = useCustomNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [team, setTeam] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [participantInfos, setParticipantInfos] = useState({});
    const [tab, setTab] = useState(0);
    const [isMember, setIsMember] = useState(false);
    const [membershipLoading, setMembershipLoading] = useState(false);

    // Check if current user is a member
    const checkMembershipStatus = () => {
        if (!user?.id || !participants.length) return;
        const userIsMember = participants.some(p => {
            const participantId = typeof p === "string" ? p : p.id;
            return participantId === user.id;
        });
        setIsMember(userIsMember);
    };

    useEffect(() => {
        checkMembershipStatus();
    }, [participants, user?.id]);

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            setLoading(true);
            setError(null);
            
            try {
                const [teamRes, partRes] = await Promise.all([
                    getTeam(id, accessToken).catch(() => null),
                    getTeamParticipants(id, accessToken).catch(() => null),
                ]);

                if (cancelled) return;
                if (!teamRes) throw new Error("team");

                setTeam(teamRes.data);
                const partArray = Array.isArray(partRes?.data) ? partRes.data : [];
                setParticipants(partArray);
                
                // Fetch participant infos if array contains id strings
                const idsToFetch = partArray
                    .filter((p) => typeof p === "string")
                    .slice(0, 20); // limit
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
            } catch {
                if (!cancelled) {
                    setError("Ошибка загрузки данных, показываю демо");
                    setTeam({
                        id: id,
                        name: "Demo Team",
                        description: "Демонстрационная команда",
                        sport: "FOOTBALL",
                        maxParticipants: 11,
                        createdAt: new Date().toISOString(),
                        owner: "user1",
                    });
                    
                    const demoParticipants = [
                        "00000000-0000-0000-0000-000000000001",
                        "00000000-0000-0000-0000-000000000002",
                        "00000000-0000-0000-0000-000000000003",
                        "00000000-0000-0000-0000-000000000004",
                    ];
                    
                    setParticipants(demoParticipants);
                    setParticipantInfos({
                        "00000000-0000-0000-0000-000000000001": { name: "Player 1", email: "player1@example.com" },
                        "00000000-0000-0000-0000-000000000002": { name: "Player 2", email: "player2@example.com" },
                        "00000000-0000-0000-0000-000000000003": { name: "Player 3", email: "player3@example.com" },
                        "00000000-0000-0000-0000-000000000004": { name: "Player 4", email: "player4@example.com" },
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

    // Handle join team
    const handleJoinTeam = async () => {
        if (!user?.id) {
            setError("Необходимо войти в систему для присоединения к команде");
            return;
        }

        setMembershipLoading(true);
        setError(null);

        try {
            await addTeamParticipant(id, user.id, accessToken);
            setIsMember(true);
            // Refresh participants list
            const partRes = await getTeamParticipants(id, accessToken);
            const partArray = Array.isArray(partRes?.data) ? partRes.data : [];
            setParticipants(partArray);
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка присоединения к команде");
        } finally {
            setMembershipLoading(false);
        }
    };

    // Handle leave team
    const handleLeaveTeam = async () => {
        if (!user?.id) {
            setError("Необходимо войти в систему");
            return;
        }

        setMembershipLoading(true);
        setError(null);

        try {
            await removeTeamParticipant(id, user.id, accessToken);
            setIsMember(false);
            // Refresh participants list
            const partRes = await getTeamParticipants(id, accessToken);
            const partArray = Array.isArray(partRes?.data) ? partRes.data : [];
            setParticipants(partArray);
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка выхода из команды");
        } finally {
            setMembershipLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!team) {
        return (
            <Alert severity="error" sx={{ m: 4 }}>
                Команда не найдена
            </Alert>
        );
    }

    const getParticipantLabel = (pIdOrObj) => {
        if (typeof pIdOrObj === "string") {
            return participantInfos[pIdOrObj]?.name || pIdOrObj;
        }
        return pIdOrObj.name || pIdOrObj.id;
    };

    const getSportIcon = (sport) => {
        switch (sport) {
            case "FOOTBALL":
                return "⚽";
            case "BASKETBALL":
                return "🏀";
            case "TENNIS":
                return "🎾";
            default:
                return "🏆";
        }
    };

    const getSportLabel = (sport) => {
        switch (sport) {
            case "FOOTBALL":
                return "Футбол";
            case "BASKETBALL":
                return "Баскетбол";
            case "TENNIS":
                return "Теннис";
            default:
                return sport;
        }
    };

    const isTeamFull = participants.length >= team.maxParticipants;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                variant="outlined"
                onClick={() => navigate("/teams")}
                sx={{ mb: 3, fontWeight: 600 }}
            >
                Назад к командам
            </Button>

            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                {team.name}
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
                            <Avatar sx={{ bgcolor: 'primary.main', fontSize: '2rem', width: 60, height: 60 }}>
                                {getSportIcon(team.sport)}
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Информация о команде
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {team.description || "—"}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {[
                            ["Вид спорта", getSportLabel(team.sport)],
                            ["Создана", formatTimestamp(team.createdAt)],
                            ["Участников", `${participants.length}/${team.maxParticipants}`],
                            ["Владелец", team.owner || "—"],
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
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {user?.id ? (
                            <>
                                {isMember ? (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<PersonRemoveIcon />}
                                        onClick={handleLeaveTeam}
                                        disabled={membershipLoading}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {membershipLoading ? "Выход..." : "Покинуть команду"}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<PersonAddIcon />}
                                        onClick={handleJoinTeam}
                                        disabled={membershipLoading || isTeamFull}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {membershipLoading ? "Присоединение..." : "Присоединиться к команде"}
                                    </Button>
                                )}
                                {isMember && (
                                    <Chip 
                                        label="✓ Вы участник команды" 
                                        color="success" 
                                        sx={{ fontWeight: 600 }}
                                    />
                                )}
                                {isTeamFull && !isMember && (
                                    <Chip 
                                        label="Команда укомплектована" 
                                        color="warning" 
                                        sx={{ fontWeight: 600 }}
                                    />
                                )}
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Войдите в систему для присоединения к команде
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
                <Tabs
                    value={tab}
                    onChange={(_, newVal) => setTab(newVal)}
                    variant="fullWidth"
                    indicatorColor="primary"
                >
                    <Tab
                        icon={<PeopleIcon />}
                        label={`Участники (${participants.length})`}
                    />
                    <Tab icon={<GroupIcon />} label="Статистика" />
                </Tabs>

                <TabPanel value={tab} index={0}>
                    {participants.length === 0 ? (
                        <Typography color="text.secondary">Пока нет участников</Typography>
                    ) : (
                        <List sx={{ width: "100%" }}>
                            {participants.map((p, idx) => {
                                const id = typeof p === "string" ? p : p.id;
                                const label = getParticipantLabel(p);
                                const userInfo = typeof p === "string" ? participantInfos[p] : p;
                                return (
                                    <ListItem
                                        key={id || idx}
                                        sx={{ mb: 1, borderRadius: 1, boxShadow: 1 }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar>{label[0]?.toUpperCase() || "U"}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={label} 
                                            secondary={userInfo?.email || id}
                                        />
                                        <Stack direction="row" spacing={1}>
                                            {id === team.owner && (
                                                <Chip 
                                                    label="Владелец" 
                                                    color="primary" 
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                            {id === user?.id && (
                                                <Chip 
                                                    label="Вы" 
                                                    color="success" 
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                        </Stack>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </TabPanel>

                <TabPanel value={tab} index={1}>
                    <Box sx={{ width: "100%", maxWidth: 600 }}>
                        <Grid container spacing={3} sx={{ justifyContent: "center" }}>
                            <Grid item xs={12} sm={6}>
                                <Card sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                                        {participants.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Текущих участников
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 700 }}>
                                        {team.maxParticipants - participants.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Свободных мест
                                    </Typography>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                <Card sx={{ p: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Заполненность команды
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ flex: 1, bgcolor: 'background.default', borderRadius: 1, height: 20 }}>
                                            <Box 
                                                sx={{ 
                                                    bgcolor: 'primary.main', 
                                                    height: '100%', 
                                                    borderRadius: 1,
                                                    width: `${(participants.length / team.maxParticipants) * 100}%`,
                                                    transition: 'width 0.3s ease'
                                                }} 
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {Math.round((participants.length / team.maxParticipants) * 100)}%
                                        </Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>
            </Card>
        </Container>
    );
} 