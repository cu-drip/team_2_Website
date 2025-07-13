import { useAuth } from "../../contexts/auth/AuthContext.js";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import { SportsEsports, Email, Phone, Shield, Forum, Star, BarChart, Cake } from "@mui/icons-material";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";

const USER_FIELDS = [
    { key: "email", label: "Email", icon: <Email /> },
    { key: "phoneNumber", label: "Phone", icon: <Phone /> },
    { key: "dateOfBirth", label: "Date of Birth", icon: <Cake /> },
];

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Navigation/quick actions
    const userQuickActions = [
        { label: "Browse Tournaments", icon: <SportsEsports />, description: "Find and join tournaments", to: "/tournaments" },
        { label: "Browse Teams", icon: <SportsEsports />, description: "Find and join teams", to: "/teams" },
        { label: "Chat", icon: <Forum />, description: "Connect with other players", to: "/chats" },
        { label: "Feedback", icon: <Star />, description: "Rate and review matches", to: "/feedback" },
    ]
    const adminQuickActions = [
        { label: "Admin Panel", icon: <Shield />, description: "Manage tournaments", to: "/admin" },
    ]

    const quickActions = [...userQuickActions, ...(user?.admin ? adminQuickActions : [])];

    return (
        <Box sx={{ height: "100%", bgcolor: "background.default", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", py: { xs: 2, md: 6 }, px: 2 }}>
            <Paper elevation={3} sx={{ width: "100%", maxWidth: 1200, p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: "background.paper", boxShadow: 6, mb: 4 }}>
                {/* Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}>
                        Welcome back{user?.name ? `, ${user.name}` : ""}!
                    </Typography>
                </Box>

                {/* User Info Card */}
                <Box sx={{ mt: 4, mb: 4, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    <Avatar src={user?.avatarUrl} alt={user?.name || "User"} sx={{ width: 80, height: 80, mb: 2, bgcolor: "primary.main", fontSize: 36 }}>
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
                        <Grid item xs={12} sm={6} key={action.label} sx={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: 220 }}>
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
