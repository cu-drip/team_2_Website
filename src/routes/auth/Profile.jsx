import { useAuth } from "../../contexts/auth/AuthContext.js";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import { SportsEsports, Chat, Email, Phone, Shield, Forum, Star, BarChart, Cake } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";
import { getUserTournaments, getChats } from "../../constants";

const USER_FIELDS = [
    { key: "email", label: "Email", icon: <Email /> },
    { key: "phoneNumber", label: "Phone", icon: <Phone /> },
    { key: "dateOfBirth", label: "Date of Birth", icon: <Cake /> },
];

export default function Profile() {
    const { user, accessToken } = useAuth();
    const [tournamentsJoined, setTournamentsJoined] = useState(0);
    const [messages, setMessages] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            try {
                if (user?.id && accessToken) {
                    const res = await getUserTournaments(user.id, accessToken);
                    if (!cancelled) setTournamentsJoined(Array.isArray(res.data) ? res.data.length : 0);
                }
                if (accessToken) {
                    try {
                        const chatRes = await getChats(accessToken);
                        if (!cancelled) setMessages(Array.isArray(chatRes.data) ? chatRes.data.length : 0);
                    } catch {
                        if (!cancelled) setMessages(0);
                    }
                }
            } catch {
                if (!cancelled) {
                    setTournamentsJoined(0);
                    setMessages(0);
                }
            }
        }
        fetchData();
        return () => {
            cancelled = true;
        };
    }, [user?.id, accessToken]);

    // Navigation/quick actions
    const quickActions = [
        { label: "Admin Panel", icon: <Shield />, description: "Manage tournaments and users", to: "/admin" },
        { label: "Browse Tournaments", icon: <SportsEsports />, description: "Find and join tournaments", to: "/tournaments" },
        { label: "Chat", icon: <Forum />, description: "Connect with other players", to: "/chats" },
        { label: "Feedback", icon: <Star />, description: "Rate and review matches", to: "/feedback/match/123123" },
        { label: "Statistics", icon: <BarChart />, description: "View your performance", to: "/statistics" },
    ];

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", py: { xs: 2, md: 6 }, px: 2 }}>
            <Paper elevation={3} sx={{ width: "100%", maxWidth: 1200, p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: "background.paper", boxShadow: 6, mb: 4 }}>
                {/* Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}>
                        Welcome back{user?.name ? `, ${user.name}` : ""}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Here is a quick snapshot of your activity.
                    </Typography>
                </Box>

                {/* Stats Cards (only API data) */}
                <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Card
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                p: 3,
                                bgcolor: "linear-gradient(135deg, #1976d2 0%, #1e88e5 100%)",
                                background: "linear-gradient(135deg, #1976d2 0%, #1e88e5 100%)",
                                color: "white",
                                boxShadow: 4,
                                borderRadius: 3,
                            }}
                        >
                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 0, mb: 1 }}>
                                <SportsEsports />
                            </Avatar>
                            <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {tournamentsJoined}
                                </Typography>
                                <Typography variant="body2">Tournaments</Typography>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Card
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                p: 3,
                                bgcolor: "linear-gradient(135deg, #fdd835 0%, #fbc02d 100%)",
                                background: "linear-gradient(135deg, #fdd835 0%, #fbc02d 100%)",
                                color: "black",
                                boxShadow: 4,
                                borderRadius: 3,
                            }}
                        >
                            <Avatar sx={{ bgcolor: "rgba(0,0,0,0.15)", mr: 0, mb: 1 }}>
                                <Chat />
                            </Avatar>
                            <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {messages}
                                </Typography>
                                <Typography variant="body2">Messages</Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                {/* User Info Card */}
                <Box sx={{ mt: 4, mb: 4, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    <Avatar src={user?.avatarUrl || undefined} alt={user?.name || "User"} sx={{ width: 80, height: 80, mb: 2, bgcolor: "primary.main", fontSize: 36 }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {user?.name || "User"} {user?.surname || ""} {user?.patronymic || ""}
                    </Typography>
                    <List
                        sx={{
                            width: "100%",
                            maxWidth: 800,
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 4,
                            p: 0,
                            m: 0,
                        }}
                    >
                        {USER_FIELDS.map(({ key, label, icon }) =>
                            user?.[key] ? (
                                <Box
                                    key={key}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "background.default",
                                        borderRadius: 2,
                                        boxShadow: 2,
                                        px: 4,
                                        py: 2,
                                        minWidth: 180,
                                    }}
                                >
                                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", mb: 1 }}>
                                        <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30, mr: 1, fontSize: 18 }}>{icon}</Avatar>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main" }}>
                                            {label}
                                        </Typography>
                                    </Box>
                                    <Typography color="text.secondary" sx={{ textAlign: "center", wordBreak: "break-all" }}>
                                        {user[key]}
                                    </Typography>
                                </Box>
                            ) : null
                        )}
                    </List>
                </Box>
                <Divider sx={{ my: 4 }} />

                {/* Quick Actions */}
                <Grid container spacing={3} justifyContent="center">
                    {quickActions.map((action) => (
                        <Grid item xs={12} sm={6} key={action.label} sx={{ display: "flex", justifyContent: "center" }}>
                            <Card
                                sx={{
                                    p: 3,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    bgcolor: "background.default",
                                    boxShadow: 2,
                                    borderRadius: 3,
                                    width: "100%",
                                    maxWidth: 220,
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <Avatar sx={{ bgcolor: "primary.main", mb: 1 }}>{action.icon}</Avatar>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, textAlign: "center" }}>
                                    {action.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: "center" }}>
                                    {action.description}
                                </Typography>
                                <Button variant="outlined" size="small" disabled={!action.to} onClick={() => action.to && navigate(action.to)} sx={{ fontWeight: 600, width: "100%" }}>
                                    Go
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Box>
    );
}
