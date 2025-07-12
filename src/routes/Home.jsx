import React from "react";
import { useAuth } from "../contexts/auth/AuthContext.js";
import { useCustomNavigate } from "../contexts/navigation/useCustomNavigate.js";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import { Chat, People, Security, SportsEsports, Star, TrendingUp } from "@mui/icons-material";

const features = [
    {
        icon: SportsEsports,
        title: "Tournament Management",
        description: "Create, organize, and manage tournaments with ease. Support for knockout, round-robin, and Swiss formats.",
    },
    {
        icon: People,
        title: "Team Collaboration",
        description: "Connect with other players, form teams, and participate in exciting competitions together.",
    },
    {
        icon: Chat,
        title: "Real-time Chat",
        description: "Communicate with tournament participants and organizers through dedicated chat channels.",
    },
    {
        icon: Star,
        title: "Feedback System",
        description: "Rate and review tournaments, matches, and players to help improve the community experience.",
    },
    {
        icon: TrendingUp,
        title: "Live Statistics",
        description: "Track your performance, view rankings, and analyze detailed statistics across all tournaments.",
    },
    {
        icon: Security,
        title: "Secure Platform",
        description: "JWT-based authentication ensures your data is safe and your account is protected.",
    },
];

const stats = [
    { value: "1,000+", label: "Active Players", color: "primary.main" },
    { value: "250+", label: "Tournaments Hosted", color: "secondary.main" },
    { value: "15", label: "Sports Categories", color: "success.main" },
    { value: "98%", label: "User Satisfaction", color: "warning.main" },
];

export default function Home() {
    const { user } = useAuth();
    const customNavigate = useCustomNavigate();

    const handleNavigation = (path) => {
        customNavigate(path);
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Hero Section */}
            <Box
                sx={{
                    position: "relative",
                    background: "linear-gradient(135deg, #1976d2 0%, #7b1fa2 50%, #1976d2 100%)",
                    color: "white",
                    py: { xs: 8, md: 12 },
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(0,0,0,0.2)",
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontSize: { xs: "2.5rem", md: "4rem" },
                                fontWeight: 700,
                                mb: 3,
                                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                            }}
                        >
                            Welcome to{" "}
                            <Box component="span" sx={{ color: "#ffd700", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
                                Drip Competition
                            </Box>
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                mb: 4,
                                maxWidth: "800px",
                                mx: "auto",
                                opacity: 0.9,
                                lineHeight: 1.6,
                            }}
                        >
                            The ultimate platform for organizing, managing, and participating in sports tournaments. Connect with players worldwide and showcase your skills.
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, justifyContent: "center" }}>
                            {user ? (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => handleNavigation("/profile")}
                                    sx={{
                                        bgcolor: "#ffd700",
                                        color: "#1976d2",
                                        px: 4,
                                        py: 1.5,
                                        fontSize: "1.1rem",
                                        fontWeight: 600,
                                        "&:hover": {
                                            bgcolor: "#ffed4e",
                                        },
                                    }}
                                >
                                    Go to Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => handleNavigation("/register")}
                                        sx={{
                                            bgcolor: "#ffd700",
                                            color: "#1976d2",
                                            px: 4,
                                            py: 1.5,
                                            fontSize: "1.1rem",
                                            fontWeight: 600,
                                            "&:hover": {
                                                bgcolor: "#ffed4e",
                                            },
                                        }}
                                    >
                                        Get Started
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => handleNavigation("/login")}
                                        sx={{
                                            borderColor: "white",
                                            color: "white",
                                            px: 4,
                                            py: 1.5,
                                            fontSize: "1.1rem",
                                            fontWeight: 600,
                                            "&:hover": {
                                                borderColor: "white",
                                                bgcolor: "rgba(255,255,255,0.1)",
                                            },
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
                <Container maxWidth="xl">
                    <Box sx={{ textAlign: "center", mb: 8 }}>
                        <Typography
                            variant="h3"
                            component="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                color: "text.primary",
                            }}
                        >
                            Everything You Need for Tournament Management
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "text.secondary",
                                maxWidth: "600px",
                                mx: "auto",
                                lineHeight: 1.6,
                            }}
                        >
                            Our comprehensive platform provides all the tools you need to create, manage, and participate in tournaments.
                        </Typography>
                    </Box>

                    <Grid container spacing={4} justifyContent="center">
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} lg={4} key={index} sx={{ display: "flex", width: "100%" }}>
                                <Card
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: 8,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2, minHeight: "fit-content" }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: "primary.main",
                                                    mr: 2,
                                                    width: 48,
                                                    height: 48,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <feature.icon />
                                            </Avatar>
                                            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, flexGrow: 1, lineHeight: 1.2 }}>
                                                {feature.title}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, flexGrow: 1 }}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Stats Section */}
            <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.default" }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} justifyContent="center">
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Box sx={{ textAlign: "center", p: 2 }}>
                                    <Typography
                                        variant="h3"
                                        component="div"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 1,
                                            color: stat.color,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)",
                    color: "white",
                    py: { xs: 8, md: 12 },
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ textAlign: "center" }}>
                        <Typography
                            variant="h3"
                            component="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                            }}
                        >
                            Ready to Start Your Tournament Journey?
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 4,
                                opacity: 0.9,
                                lineHeight: 1.6,
                            }}
                        >
                            Join thousands of players and organizers who trust Drip Competition for their tournament needs.
                        </Typography>
                        {!user && (
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleNavigation("/register")}
                                sx={{
                                    bgcolor: "white",
                                    color: "primary.main",
                                    px: 4,
                                    py: 1.5,
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    "&:hover": {
                                        bgcolor: "grey.100",
                                    },
                                }}
                            >
                                Create Your Account
                            </Button>
                        )}
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
