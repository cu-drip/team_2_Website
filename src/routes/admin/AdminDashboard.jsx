import { Box, Typography, Grid, Card, CardContent, Button, Avatar } from "@mui/material";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";
import FeedbackIcon from "@mui/icons-material/Feedback";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const adminFeatures = [
    {
        title: "Управление турнирами",
        description: "Редактирование информации о турнирах",
        icon: <EmojiEventsIcon />,
        path: "/admin/tournaments",
        color: "primary.main"
    },
    {
        title: "Управление матчами",
        description: "Редактирование результатов и информации о матчах",
        icon: <SportsEsportsIcon />,
        path: "/admin/matches",
        color: "secondary.main"
    },
    {
        title: "Управление отзывами",
        description: "Просмотр и управление отзывами пользователей",
        icon: <FeedbackIcon />,
        path: "/admin/feedback",
        color: "success.main"
    },
    {
        title: "Управление пользователями",
        description: "Просмотр и управление пользователями системы",
        icon: <PeopleIcon />,
        path: "/admin/users",
        color: "warning.main"
    }
];

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useCustomNavigate();

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

    return (
        <Box sx={{ height: "100%", bgcolor: "background.default", p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Панель администратора
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/")}
                    sx={{ fontWeight: 600 }}
                >
                    На главную
                </Button>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Добро пожаловать в панель администратора. Выберите раздел для управления системой.
            </Typography>

            <Grid container spacing={3} sx={{ justifyContent: "center" }}>
                {adminFeatures.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index} sx={{ width: "100%", maxWidth: "500px" }} >
                        <Card 
                            sx={{
                                height: '100%', 
                                boxShadow: 4, 
                                borderRadius: 2,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 8,
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Avatar 
                                    sx={{ 
                                        bgcolor: feature.color, 
                                        width: 60, 
                                        height: 60, 
                                        mx: 'auto', 
                                        mb: 2,
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    {feature.icon}
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {feature.description}
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate(feature.path)}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Перейти
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 