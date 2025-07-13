import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Chip,
    Divider,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    FormControlLabel,
} from "@mui/material";
import {
    ArrowBack,
    Edit,
    Save,
    Cancel,
    Delete,
    Person,
    Group,
    SportsEsports,
    Event,
    AttachMoney,
    People,
    Add,
    Remove,
} from "@mui/icons-material";
import {
    getTournaments,
    getTournament,
    updateTournament,
    getTournamentParticipants,
    registerParticipant,
    unregisterParticipant,
    getUserById,
    getTeams,
    getTeamParticipants,
} from "../../constants.js";

const sportOptions = [
    { value: "FOOTBALL", label: "Футбол" },
    { value: "TENNIS", label: "Теннис" },
    { value: "BASKETBALL", label: "Баскетбол" },
];

const tournamentTypeOptions = [
    { value: "solo", label: "Индивидуальный" },
    { value: "team", label: "Командный" },
];

const groupTypeOptions = [
    { value: "olympic", label: "Олимпийская система" },
    { value: "round_robin", label: "Круговая система" },
    { value: "swiss", label: "Швейцарская система" },
];

// Mock data helper functions
const getMockParticipants = (tournamentId) => {
    const participantCounts = {
        "demo-tournament-1": 24, // Football Championship
        "demo-tournament-2": 12, // Tennis Masters
        "demo-tournament-3": 16, // Basketball Street
        "demo-tournament-4": 8,  // Amateur Football
        "demo-tournament-5": 6,  // Tennis Open
        "demo-tournament-6": 14, // Basketball 3x3
    };
    
    const count = participantCounts[tournamentId] || 8;
    return Array.from({ length: count }, (_, i) => ({
        id: `participant-${tournamentId}-${i + 1}`,
    }));
};

const getMockParticipantName = (tournamentId, index) => {
    const names = {
        "demo-tournament-1": [
            "Алексей Петров", "Дмитрий Сидоров", "Иван Козлов", "Сергей Волков",
            "Андрей Соколов", "Михаил Морозов", "Владимир Лебедев", "Николай Козлов",
            "Павел Новиков", "Артем Морозов", "Егор Петров", "Даниил Сидоров",
            "Максим Козлов", "Александр Волков", "Денис Соколов", "Роман Морозов",
            "Виталий Лебедев", "Антон Козлов", "Степан Новиков", "Григорий Морозов",
            "Тимур Петров", "Арсений Сидоров", "Марк Козлов", "Лев Волков"
        ],
        "demo-tournament-2": [
            "Анна Иванова", "Мария Петрова", "Елена Сидорова", "Ольга Козлова",
            "Наталья Волкова", "Татьяна Соколова", "Ирина Морозова", "Светлана Лебедева",
            "Людмила Козлова", "Галина Новикова", "Валентина Морозова", "Зинаида Петрова"
        ],
        "demo-tournament-3": [
            "Team Alpha", "Team Beta", "Team Gamma", "Team Delta",
            "Team Echo", "Team Foxtrot", "Team Golf", "Team Hotel",
            "Team India", "Team Juliet", "Team Kilo", "Team Lima",
            "Team Mike", "Team November", "Team Oscar", "Team Papa"
        ],
        "demo-tournament-4": [
            "FC Dynamo", "FC Spartak", "FC Lokomotiv", "FC Zenit",
            "FC CSKA", "FC Rubin", "FC Rostov", "FC Krasnodar"
        ],
        "demo-tournament-5": [
            "Роман Теннисов", "Алексей Ракетов", "Дмитрий Мячов", "Сергей Сетов",
            "Андрей Подачов", "Михаил Удар"
        ],
        "demo-tournament-6": [
            "Street Ballers", "Urban Hoops", "City Dunkers", "Court Kings",
            "Basket Masters", "Rim Rockers", "Net Swishers", "Board Bangers",
            "Alley Oops", "Fast Breakers", "Three Pointers", "Slam Dunkers",
            "Free Throwers", "Rebound Kings"
        ]
    };
    
    return names[tournamentId]?.[index] || `Participant ${index + 1}`;
};

function TabPanel({ children, value, index }) {
    return (
        <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
            {value === index && children}
        </Box>
    );
}

export default function TournamentAdmin() {
    const { user, accessToken } = useAuth();
    const navigate = useCustomNavigate();

    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [participantInfos, setParticipantInfos] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [tab, setTab] = useState(0);
    const [editForm, setEditForm] = useState({});
    const [teams, setTeams] = useState([]);
    const [teamParticipants, setTeamParticipants] = useState({});
    const [addParticipantDialog, setAddParticipantDialog] = useState(false);
    const [newParticipantId, setNewParticipantId] = useState("");
    const [addingParticipant, setAddingParticipant] = useState(false);

    useEffect(() => {
        fetchTournaments();
    }, []);

    useEffect(() => {
        if (selectedTournament) {
            fetchTournamentData(selectedTournament.id);
        }
    }, [selectedTournament]);

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

    const fetchTournaments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getTournaments(accessToken);
            const tournamentsData = Array.isArray(res.data) ? res.data : [];
            setTournaments(tournamentsData);
        } catch {
            setError("Ошибка загрузки турниров");
            setTournaments([
                {
                    id: "demo-tournament-1",
                    title: "City Football Championship",
                    description: "Ежегодный турнир среди любительских команд города. Приглашаем всех желающих принять участие в захватывающих матчах!",
                    sport: "FOOTBALL",
                    typeTournament: "team",
                    typeGroup: "olympic",
                    matchesNumber: 16,
                    startTime: "2024-05-10T14:00:00Z",
                    entryCost: 1000.0,
                    maxParticipants: 32,
                    currentParticipants: 24,
                    status: "active",
                },
                {
                    id: "demo-tournament-2",
                    title: "Tennis Masters Cup",
                    description: "Индивидуальный турнир по теннису для профессионалов и любителей. Призовой фонд 50,000₽",
                    sport: "TENNIS",
                    typeTournament: "solo",
                    typeGroup: "olympic",
                    matchesNumber: 8,
                    startTime: "2024-06-15T10:00:00Z",
                    entryCost: 500.0,
                    maxParticipants: 16,
                    currentParticipants: 12,
                    status: "prepared",
                },
                {
                    id: "demo-tournament-3",
                    title: "Basketball Street League",
                    description: "Уличный баскетбол в центре города. Командный турнир с крутыми призами",
                    sport: "BASKETBALL",
                    typeTournament: "team",
                    typeGroup: "round_robin",
                    matchesNumber: 24,
                    startTime: "2024-07-20T16:00:00Z",
                    entryCost: 750.0,
                    maxParticipants: 20,
                    currentParticipants: 16,
                    status: "active",
                },
                {
                    id: "demo-tournament-4",
                    title: "Amateur Football League",
                    description: "Любительская футбольная лига для всех возрастов. Регулярные матчи каждые выходные",
                    sport: "FOOTBALL",
                    typeTournament: "team",
                    typeGroup: "swiss",
                    matchesNumber: 12,
                    startTime: "2024-08-01T09:00:00Z",
                    entryCost: 300.0,
                    maxParticipants: 12,
                    currentParticipants: 8,
                    status: "prepared",
                },
                {
                    id: "demo-tournament-5",
                    title: "Tennis Open Championship",
                    description: "Открытый чемпионат по теннису. Индивидуальные соревнования для всех уровней",
                    sport: "TENNIS",
                    typeTournament: "solo",
                    typeGroup: "olympic",
                    matchesNumber: 6,
                    startTime: "2024-09-10T11:00:00Z",
                    entryCost: 200.0,
                    maxParticipants: 8,
                    currentParticipants: 6,
                    status: "prepared",
                },
                {
                    id: "demo-tournament-6",
                    title: "Basketball 3x3 Tournament",
                    description: "Турнир по баскетболу 3x3. Быстрые матчи, динамичная игра",
                    sport: "BASKETBALL",
                    typeTournament: "team",
                    typeGroup: "olympic",
                    matchesNumber: 10,
                    startTime: "2024-10-05T14:00:00Z",
                    entryCost: 400.0,
                    maxParticipants: 16,
                    currentParticipants: 14,
                    status: "active",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTournamentData = async (tournamentId) => {
        try {
            // Fetch tournament details
            const tournamentRes = await getTournament(tournamentId, accessToken);
            const tournamentData = tournamentRes.data;
            setSelectedTournament(tournamentData);
            setEditForm({
                title: tournamentData.title || "",
                description: tournamentData.description || "",
                sport: tournamentData.sport || "",
                typeTournament: tournamentData.typeTournament || "solo",
                typeGroup: tournamentData.typeGroup || "olympic",
                startTime: tournamentData.startTime ? tournamentData.startTime.slice(0, 16) : "",
                entryCost: tournamentData.entryCost?.toString() || "",
                maxParticipants: tournamentData.maxParticipants?.toString() || "",
                matchesNumber: tournamentData.matchesNumber?.toString() || "",
            });

            // Fetch participants
            const participantsRes = await getTournamentParticipants(tournamentId, accessToken);
            const participantsData = Array.isArray(participantsRes.data) ? participantsRes.data : [];
            setParticipants(participantsData);

            // Fetch participant details
            const participantDetails = {};
            for (const participant of participantsData) {
                try {
                    const userRes = await getUserById(participant.id || participant, accessToken);
                    participantDetails[participant.id || participant] = userRes.data;
                } catch {
                    // Use demo data if API fails
                    participantDetails[participant.id || participant] = {
                        id: participant.id || participant,
                        name: `User ${participant.id || participant}`,
                        email: `user${participant.id || participant}@example.com`,
                    };
                }
            }
            setParticipantInfos(participantDetails);

            // Add mock participants for demo tournaments
            if (tournamentData.id?.startsWith("demo-")) {
                const mockParticipants = getMockParticipants(tournamentData.id);
                setParticipants(mockParticipants);
                
                const mockParticipantInfos = {};
                mockParticipants.forEach((participant, index) => {
                    const participantId = participant.id || participant;
                    mockParticipantInfos[participantId] = {
                        id: participantId,
                        name: getMockParticipantName(tournamentData.id, index),
                        email: `participant${index + 1}@${tournamentData.sport.toLowerCase()}.com`,
                    };
                });
                setParticipantInfos(mockParticipantInfos);
                
                // For team tournaments, add some teams as registered participants
                if (tournamentData.typeTournament === "team") {
                    const registeredTeams = ["team-1", "team-2", "team-3", "team-4"];
                    setParticipants(registeredTeams);
                }
            }

            // Fetch teams if tournament is team type
            if (tournamentData.typeTournament === "team") {
                try {
                    const teamsRes = await getTeams(accessToken);
                    const teamsData = Array.isArray(teamsRes.data) ? teamsRes.data : [];
                    setTeams(teamsData);

                    // Fetch team participants
                    const teamParticipantsData = {};
                    for (const team of teamsData) {
                        try {
                            const teamParticipantsRes = await getTeamParticipants(team.id, accessToken);
                            teamParticipantsData[team.id] = Array.isArray(teamParticipantsRes.data) ? teamParticipantsRes.data : [];
                        } catch {
                            teamParticipantsData[team.id] = [];
                        }
                    }
                    setTeamParticipants(teamParticipantsData);
                } catch {
                    // Use demo teams
                    setTeams([
                        {
                            id: "team-1",
                            name: "Alpha Team",
                            description: "Футбольная команда",
                            sport: "FOOTBALL",
                            maxParticipants: 11,
                            currentParticipants: 8,
                        },
                        {
                            id: "team-2",
                            name: "Beta Squad",
                            description: "Команда по футболу",
                            sport: "FOOTBALL",
                            maxParticipants: 11,
                            currentParticipants: 10,
                        },
                        {
                            id: "team-3",
                            name: "Gamma Force",
                            description: "Футбольная команда",
                            sport: "FOOTBALL",
                            maxParticipants: 11,
                            currentParticipants: 6,
                        },
                        {
                            id: "team-4",
                            name: "Delta Warriors",
                            description: "Команда по футболу",
                            sport: "FOOTBALL",
                            maxParticipants: 11,
                            currentParticipants: 9,
                        },
                        {
                            id: "team-5",
                            name: "Echo Eagles",
                            description: "Футбольная команда",
                            sport: "FOOTBALL",
                            maxParticipants: 11,
                            currentParticipants: 7,
                        },
                        {
                            id: "team-6",
                            name: "Foxtrot Falcons",
                            description: "Команда по футболу",
                            sport: "FOOTBALL",
                            maxParticipants: 11,
                            currentParticipants: 11,
                        },
                    ]);
                    
                    // Add mock team participants
                    const mockTeamParticipants = {
                        "team-1": [
                            { id: "player-1-1", name: "Алексей Петров" },
                            { id: "player-1-2", name: "Дмитрий Сидоров" },
                            { id: "player-1-3", name: "Иван Козлов" },
                            { id: "player-1-4", name: "Сергей Волков" },
                            { id: "player-1-5", name: "Андрей Соколов" },
                            { id: "player-1-6", name: "Михаил Морозов" },
                            { id: "player-1-7", name: "Владимир Лебедев" },
                            { id: "player-1-8", name: "Николай Козлов" },
                        ],
                        "team-2": [
                            { id: "player-2-1", name: "Павел Новиков" },
                            { id: "player-2-2", name: "Артем Морозов" },
                            { id: "player-2-3", name: "Егор Петров" },
                            { id: "player-2-4", name: "Даниил Сидоров" },
                            { id: "player-2-5", name: "Максим Козлов" },
                            { id: "player-2-6", name: "Александр Волков" },
                            { id: "player-2-7", name: "Денис Соколов" },
                            { id: "player-2-8", name: "Роман Морозов" },
                            { id: "player-2-9", name: "Виталий Лебедев" },
                            { id: "player-2-10", name: "Антон Козлов" },
                        ],
                        "team-3": [
                            { id: "player-3-1", name: "Степан Новиков" },
                            { id: "player-3-2", name: "Григорий Морозов" },
                            { id: "player-3-3", name: "Тимур Петров" },
                            { id: "player-3-4", name: "Арсений Сидоров" },
                            { id: "player-3-5", name: "Марк Козлов" },
                            { id: "player-3-6", name: "Лев Волков" },
                        ],
                        "team-4": [
                            { id: "player-4-1", name: "Игорь Смирнов" },
                            { id: "player-4-2", name: "Константин Попов" },
                            { id: "player-4-3", name: "Артур Соколов" },
                            { id: "player-4-4", name: "Руслан Морозов" },
                            { id: "player-4-5", name: "Денис Лебедев" },
                            { id: "player-4-6", name: "Антон Козлов" },
                            { id: "player-4-7", name: "Степан Новиков" },
                            { id: "player-4-8", name: "Григорий Морозов" },
                            { id: "player-4-9", name: "Тимур Петров" },
                        ],
                        "team-5": [
                            { id: "player-5-1", name: "Арсений Сидоров" },
                            { id: "player-5-2", name: "Марк Козлов" },
                            { id: "player-5-3", name: "Лев Волков" },
                            { id: "player-5-4", name: "Игорь Смирнов" },
                            { id: "player-5-5", name: "Константин Попов" },
                            { id: "player-5-6", name: "Артур Соколов" },
                            { id: "player-5-7", name: "Руслан Морозов" },
                        ],
                        "team-6": [
                            { id: "player-6-1", name: "Денис Лебедев" },
                            { id: "player-6-2", name: "Антон Козлов" },
                            { id: "player-6-3", name: "Степан Новиков" },
                            { id: "player-6-4", name: "Григорий Морозов" },
                            { id: "player-6-5", name: "Тимур Петров" },
                            { id: "player-6-6", name: "Арсений Сидоров" },
                            { id: "player-6-7", name: "Марк Козлов" },
                            { id: "player-6-8", name: "Лев Волков" },
                            { id: "player-6-9", name: "Игорь Смирнов" },
                            { id: "player-6-10", name: "Константин Попов" },
                            { id: "player-6-11", name: "Артур Соколов" },
                        ],
                    };
                    setTeamParticipants(mockTeamParticipants);
                }
            }
        } catch {
            setError("Ошибка загрузки данных турнира");
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setEditForm({
            title: selectedTournament.title || "",
            description: selectedTournament.description || "",
            sport: selectedTournament.sport || "",
            typeTournament: selectedTournament.typeTournament || "solo",
            typeGroup: selectedTournament.typeGroup || "olympic",
            startTime: selectedTournament.startTime ? selectedTournament.startTime.slice(0, 16) : "",
            entryCost: selectedTournament.entryCost?.toString() || "",
            maxParticipants: selectedTournament.maxParticipants?.toString() || "",
            matchesNumber: selectedTournament.matchesNumber?.toString() || "",
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            const updateData = {
                title: editForm.title.trim(),
                description: editForm.description.trim() || null,
                sport: editForm.sport,
                typeTournament: editForm.typeTournament,
                typeGroup: editForm.typeGroup,
                startTime: editForm.startTime,
                entryCost: editForm.entryCost ? parseFloat(editForm.entryCost) : null,
                maxParticipants: editForm.maxParticipants ? parseInt(editForm.maxParticipants) : null,
                matchesNumber: editForm.matchesNumber ? parseInt(editForm.matchesNumber) : null,
            };

            await updateTournament(selectedTournament.id, updateData, accessToken);
            
            // Update local state
            setSelectedTournament(prev => ({ ...prev, ...updateData }));
            setEditing(false);
            
            // Refresh tournaments list
            await fetchTournaments();
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка обновления турнира");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveParticipant = async (participantId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого участника?")) {
            return;
        }

        try {
            await unregisterParticipant(
                selectedTournament.id,
                participantId,
                selectedTournament.typeTournament,
                accessToken
            );
            
            // Remove from local state
            setParticipants(prev => prev.filter(p => (p.id || p) !== participantId));
            setParticipantInfos(prev => {
                const newState = { ...prev };
                delete newState[participantId];
                return newState;
            });
        } catch {
            setError("Ошибка удаления участника");
        }
    };

    const handleAddParticipant = async () => {
        if (!newParticipantId.trim()) {
            setError("Введите ID участника");
            return;
        }

        if (participants.some(p => (p.id || p) === newParticipantId.trim())) {
            setError("Участник уже зарегистрирован");
            return;
        }

        setAddingParticipant(true);
        setError(null);

        try {
            await registerParticipant(
                selectedTournament.id,
                newParticipantId.trim(),
                selectedTournament.typeTournament,
                accessToken
            );
            
            // Add to local state
            const newParticipant = { id: newParticipantId.trim() };
            setParticipants(prev => [...prev, newParticipant]);
            
            // Fetch participant info
            try {
                const userRes = await getUserById(newParticipantId.trim(), accessToken);
                setParticipantInfos(prev => ({
                    ...prev,
                    [newParticipantId.trim()]: userRes.data
                }));
            } catch {
                setParticipantInfos(prev => ({
                    ...prev,
                    [newParticipantId.trim()]: {
                        id: newParticipantId.trim(),
                        name: `User ${newParticipantId.trim()}`,
                        email: `user${newParticipantId.trim()}@example.com`
                    }
                }));
            }
            
            setNewParticipantId("");
            setAddParticipantDialog(false);
        } catch {
            setError("Ошибка добавления участника");
        } finally {
            setAddingParticipant(false);
        }
    };

    const handleFormChange = (field) => (event) => {
        setEditForm(prev => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const getParticipantDisplayName = (participant) => {
        const participantId = participant.id || participant;
        const info = participantInfos[participantId];
        return info ? info.name : `User ${participantId}`;
    };

    const getParticipantEmail = (participant) => {
        const participantId = participant.id || participant;
        const info = participantInfos[participantId];
        return info ? info.email : `user${participantId}@example.com`;
    };

    return (
        <Box sx={{ height: "100%", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Управление турнирами
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/admin")}
                    sx={{ fontWeight: 600 }}
                >
                    Назад к панели
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Tournaments List */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Список турниров
                            </Typography>
                            {loading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <List sx={{ overflow: "auto", maxHeight: "600px" }}>
                                    {tournaments.map((tournament) => (
                                        <ListItem
                                            key={tournament.id}
                                            button
                                            selected={selectedTournament?.id === tournament.id}
                                            onClick={() => setSelectedTournament(tournament)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 1,
                                                border: selectedTournament?.id === tournament.id ? 2 : 1,
                                                borderColor: selectedTournament?.id === tournament.id ? "primary.main" : "divider",
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: "primary.main" }}>
                                                    <SportsEsports />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={tournament.title}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {tournament.sport} • {tournament.typeTournament === "team" ? "Командный" : "Индивидуальный"}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Участников: {tournament.currentParticipants || 0}/{tournament.maxParticipants || "∞"}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tournament Details */}
                <Grid item xs={12} md={8}>
                    {selectedTournament ? (
                        <Card sx={{ height: "100%", width: "100%" }}>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {selectedTournament.title}
                                    </Typography>
                                    {editing ? (
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Save />}
                                                onClick={handleSave}
                                                disabled={loading}
                                            >
                                                Сохранить
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Cancel />}
                                                onClick={handleCancel}
                                            >
                                                Отмена
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            startIcon={<Edit />}
                                            onClick={handleEdit}
                                        >
                                            Редактировать
                                        </Button>
                                    )}
                                </Box>

                                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
                                    <Tab label="Информация" />
                                    <Tab label="Участники" />
                                </Tabs>

                                <TabPanel value={tab} index={0}>
                                    <Box sx={{ mx: "auto" }}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} direction="column">
                                                <TextField
                                                    fullWidth
                                                    label="Название турнира"
                                                    value={editing ? editForm.title : selectedTournament.title}
                                                    onChange={editing ? handleFormChange("title") : undefined}
                                                    disabled={!editing}
                                                    sx={{ mb: 2 }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    label="Описание"
                                                    value={editing ? editForm.description : selectedTournament.description || ""}
                                                    onChange={editing ? handleFormChange("description") : undefined}
                                                    disabled={!editing}
                                                    sx={{ mb: 2 }}
                                                />
                                                <FormControl fullWidth sx={{ mb: 2 }}>
                                                    <InputLabel>Вид спорта</InputLabel>
                                                    <Select
                                                        value={editing ? editForm.sport : selectedTournament.sport}
                                                        onChange={editing ? handleFormChange("sport") : undefined}
                                                        disabled={!editing}
                                                        label="Вид спорта"
                                                    >
                                                        {sportOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} direction="column">
                                                <FormControl fullWidth sx={{ mb: 2 }}>
                                                    <InputLabel>Тип турнира</InputLabel>
                                                    <Select
                                                        value={editing ? editForm.typeTournament : selectedTournament.typeTournament}
                                                        onChange={editing ? handleFormChange("typeTournament") : undefined}
                                                        disabled={!editing}
                                                        label="Тип турнира"
                                                    >
                                                        {tournamentTypeOptions.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <FormControl fullWidth sx={{ mb: 2 }}>
                                                    <InputLabel>Система проведения</InputLabel>
                                                    <Select
                                                        value={editing ? editForm.typeGroup : selectedTournament.typeGroup}
                                                        onChange={editing ? handleFormChange("typeGroup") : undefined}
                                                        disabled={!editing}
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
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    type="datetime-local"
                                                    label="Дата и время начала"
                                                    value={editing ? editForm.startTime : (selectedTournament.startTime ? selectedTournament.startTime.slice(0, 16) : "")}
                                                    onChange={editing ? handleFormChange("startTime") : undefined}
                                                    disabled={!editing}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ mb: 2 }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    type="datetime-local"
                                                    label="Дата и время конца"
                                                    value={editing ? editForm.endTime : (selectedTournament.endTime ? selectedTournament.endTime.slice(0, 16) : "")}
                                                    onChange={editing ? handleFormChange("endTime") : undefined}
                                                    disabled={!editing}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ mb: 2 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Стоимость участия"
                                                    value={editing ? editForm.entryCost : (selectedTournament.entryCost || "")}
                                                    onChange={editing ? handleFormChange("entryCost") : undefined}
                                                    disabled={!editing}
                                                    sx={{ mb: 2 }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Максимум участников"
                                                    value={editing ? editForm.maxParticipants : (selectedTournament.maxParticipants || "")}
                                                    onChange={editing ? handleFormChange("maxParticipants") : undefined}
                                                    disabled={!editing}
                                                    sx={{ mb: 2 }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Количество матчей"
                                                    value={editing ? editForm.matchesNumber : (selectedTournament.matchesNumber || "")}
                                                    onChange={editing ? handleFormChange("matchesNumber") : undefined}
                                                    disabled={!editing}
                                                    sx={{ mb: 2 }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </TabPanel>

                                <TabPanel value={tab} index={1} sx={{ width: "100%" }}>
                                    <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            Участники ({participants.length})
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={() => setAddParticipantDialog(true)}
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Добавить участника
                                        </Button>
                                    </Box>
                                    {selectedTournament.typeTournament === "team" ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Командные турниры: участники отображаются по командам
                                        </Typography>
                                    ) : null}

                                    {selectedTournament.typeTournament === "team" ? (
                                        // Team participants view
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Команда</TableCell>
                                                        <TableCell>Участники команды</TableCell>
                                                        <TableCell>Действия</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {teams.map((team) => {
                                                        const teamMembers = teamParticipants[team.id] || [];
                                                        const isRegistered = participants.some(p => (p.id || p) === team.id);
                                                        
                                                        return (
                                                            <TableRow key={team.id}>
                                                                <TableCell>
                                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                        <Avatar sx={{ width: 32, height: 32 }}>
                                                                            <Group />
                                                                        </Avatar>
                                                                        <Box>
                                                                            <Typography variant="body2" fontWeight={600}>
                                                                                {team.name}
                                                                            </Typography>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                {teamMembers.length}/{team.maxParticipants || 11} участников
                                                                            </Typography>
                                                                        </Box>
                                                                        {isRegistered && (
                                                                            <Chip label="Зарегистрирована" color="success" size="small" />
                                                                        )}
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                                                        {teamMembers.slice(0, 5).map((member) => (
                                                                            <Chip
                                                                                key={member.id}
                                                                                label={member.name || `User ${member.id}`}
                                                                                size="small"
                                                                                variant="outlined"
                                                                            />
                                                                        ))}
                                                                        {teamMembers.length > 5 && (
                                                                            <Chip
                                                                                label={`+${teamMembers.length - 5}`}
                                                                                size="small"
                                                                                variant="outlined"
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isRegistered && (
                                                                        <Button
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={() => handleRemoveParticipant(team.id)}
                                                                        >
                                                                            Удалить
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        // Individual participants view
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Участник</TableCell>
                                                        <TableCell>Email</TableCell>
                                                        <TableCell>Действия</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {participants.map((participant) => (
                                                        <TableRow key={participant.id || participant}>
                                                            <TableCell>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <Avatar sx={{ width: 32, height: 32 }}>
                                                                        <Person />
                                                                    </Avatar>
                                                                    <Typography variant="body2">
                                                                        {getParticipantDisplayName(participant)}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {getParticipantEmail(participant)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => handleRemoveParticipant(participant.id || participant)}
                                                                >
                                                                    <Delete />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </TabPanel>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                                    Выберите турнир для просмотра и редактирования
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>

            {/* Add Participant Dialog */}
            <Dialog
                open={addParticipantDialog}
                onClose={() => setAddParticipantDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Добавить участника</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Введите ID пользователя для добавления в турнир:
                    </Typography>
                    <TextField
                        fullWidth
                        label="ID пользователя"
                        value={newParticipantId}
                        onChange={(e) => setNewParticipantId(e.target.value)}
                        placeholder="Введите ID пользователя..."
                        disabled={addingParticipant}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setAddParticipantDialog(false)}
                        disabled={addingParticipant}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleAddParticipant}
                        variant="contained"
                        disabled={!newParticipantId.trim() || addingParticipant}
                        startIcon={<Add />}
                    >
                        {addingParticipant ? "Добавление..." : "Добавить"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 