import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { formatTimestamp, getAdminUserMatchFeedback, getAdminUserTournamentFeedback, getUserById } from "../../constants.js";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Pagination from "@mui/material/Pagination";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";

export default function AdminUserFeedbacks() {
    const { userId } = useParams();
    const { user, accessToken } = useAuth();
    const [matchFeedbacks, setMatchFeedbacks] = useState([]);
    const [tournamentFeedbacks, setTournamentFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const customNavigate = useCustomNavigate();

    // Pagination state for matches
    const [matchCurrentPage, setMatchCurrentPage] = useState(0);
    const [matchTotalPages, setMatchTotalPages] = useState(0);
    const [matchTotalElements, setMatchTotalElements] = useState(0);

    // Pagination state for tournaments
    const [tournamentCurrentPage, setTournamentCurrentPage] = useState(0);
    const [tournamentTotalPages, setTournamentTotalPages] = useState(0);
    const [tournamentTotalElements, setTournamentTotalElements] = useState(0);

    const [pageSize] = useState(20);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                // Fetch all data in parallel
                const [userRes, matchRes, tournamentRes] = await Promise.all([
                    getUserById(userId, accessToken),
                    getAdminUserMatchFeedback(userId, accessToken, 0, pageSize),
                    getAdminUserTournamentFeedback(userId, accessToken, 0, pageSize),
                ]);

                // Handle match feedbacks
                const matchData = matchRes.data;
                setMatchFeedbacks(matchData.content || []);
                setMatchTotalPages(matchData.totalPages || 0);
                setMatchTotalElements(matchData.totalElements || 0);
                setMatchCurrentPage(matchData.number || 0);

                // Handle tournament feedbacks
                const tournamentData = tournamentRes.data;
                setTournamentFeedbacks(tournamentData.content || []);
                setTournamentTotalPages(tournamentData.totalPages || 0);
                setTournamentTotalElements(tournamentData.totalElements || 0);
                setTournamentCurrentPage(tournamentData.number || 0);

                setUserInfo(userRes.data);
            } catch {
                setUserInfo(null);
                setError("Ошибка загрузки данных, показаны тестовые данные");
            } finally {
                setLoading(false);
            }
        }

        if (user?.admin) {
            fetchData();
        } else {
            customNavigate("/");
        }
    }, [userId, accessToken, user, customNavigate, pageSize]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleMatchPageChange = async (event, newPage) => {
        const pageIndex = newPage - 1;
        setMatchCurrentPage(pageIndex);
        try {
            const res = await getAdminUserMatchFeedback(userId, accessToken, pageIndex, pageSize);
            const responseData = res.data;
            setMatchFeedbacks(responseData.content || []);
            setMatchTotalPages(responseData.totalPages || 0);
            setMatchTotalElements(responseData.totalElements || 0);
        } catch {
            // Handle error silently or show message
        }
    };

    const handleTournamentPageChange = async (event, newPage) => {
        const pageIndex = newPage - 1;
        setTournamentCurrentPage(pageIndex);
        try {
            const res = await getAdminUserTournamentFeedback(userId, accessToken, pageIndex, pageSize);
            const responseData = res.data;
            setTournamentFeedbacks(responseData.content || []);
            setTournamentTotalPages(responseData.totalPages || 0);
            setTournamentTotalElements(responseData.totalElements || 0);
        } catch {
            // Handle error silently or show message
        }
    };

    if (!user?.admin) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <Typography color="error" variant="h6">
                    Доступ только для администраторов
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: "100%",
                bgcolor: "background.default",
                p: { xs: 2, sm: 4 },
                display: "flex",
                flexDirection: "column",
                gap: 3,
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    color: "primary.main",
                    mb: 2,
                    fontWeight: 700,
                    fontSize: { xs: "1.8rem", sm: "2.5rem" },
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                }}
            >
                {userInfo?.avatarUrl && <Avatar src={userInfo.avatarUrl} alt={userInfo?.name || "Аватар"} sx={{ width: 40, height: 40 }} />}
                {userInfo?.name ? `${userInfo.name} (${userInfo.email || userId})` : `Отзывы Пользователя (admin)`}
            </Typography>

            {error && (
                <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
                    {error}
                </Typography>
            )}

            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    maxWidth: "1200px",
                    mx: "auto",
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        mb: 3,
                        "& .MuiTab-root": {
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            fontWeight: 600,
                            textTransform: "none",
                            minHeight: 48,
                        },
                    }}
                >
                    <Tab label={`Отзывы о матчах (${matchTotalElements})`} sx={{ color: "text.secondary" }} />
                    <Tab label={`Отзывы о турнирах (${tournamentTotalElements})`} sx={{ color: "text.secondary" }} />
                </Tabs>

                <Box sx={{ minHeight: "50vh" }}>
                    {activeTab === 0 && (
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "primary.main",
                                    mb: 3,
                                    fontWeight: 600,
                                    fontSize: { xs: "1.1rem", sm: "1.3rem" },
                                    textAlign: "center",
                                }}
                            >
                                Отзывы о матчах
                            </Typography>
                            <Box
                                sx={{
                                    maxHeight: "50vh",
                                    overflowY: "auto",
                                    textAlign: "left",
                                    bgcolor: "background.default",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    p: 3,
                                    mb: 3,
                                }}
                            >
                                {loading ? (
                                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                                        Загрузка...
                                    </Typography>
                                ) : matchFeedbacks.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                                        Пока нет отзывов о матчах
                                    </Typography>
                                ) : (
                                    matchFeedbacks.map((fb) => (
                                        <Paper
                                            key={fb.id}
                                            sx={{
                                                p: 3,
                                                mb: 3,
                                                bgcolor: "background.paper",
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "divider",
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 600, color: "primary.main", mb: 1 }}>Матч: {fb.matchId}</Typography>
                                            <Rating value={fb.rating} readOnly size="medium" sx={{ mb: 1 }} />
                                            <Typography sx={{ fontSize: "1rem", mt: 1, lineHeight: 1.5 }}>{fb.text}</Typography>
                                            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 1 }}>{formatTimestamp(fb.created_at)}</Typography>
                                        </Paper>
                                    ))
                                )}
                            </Box>

                            {matchTotalPages > 1 && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                                    <Pagination count={matchTotalPages} page={matchCurrentPage + 1} onChange={handleMatchPageChange} color="primary" size="large" showFirstButton showLastButton />
                                </Box>
                            )}
                        </Box>
                    )}

                    {activeTab === 1 && (
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "primary.main",
                                    mb: 3,
                                    fontWeight: 600,
                                    fontSize: { xs: "1.1rem", sm: "1.3rem" },
                                    textAlign: "center",
                                }}
                            >
                                Отзывы о турнирах
                            </Typography>
                            <Box
                                sx={{
                                    maxHeight: "50vh",
                                    overflowY: "auto",
                                    textAlign: "left",
                                    bgcolor: "background.default",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    p: 3,
                                    mb: 3,
                                }}
                            >
                                {loading ? (
                                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                                        Загрузка...
                                    </Typography>
                                ) : tournamentFeedbacks.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                                        Пока нет отзывов о турнирах
                                    </Typography>
                                ) : (
                                    tournamentFeedbacks.map((fb) => (
                                        <Paper
                                            key={fb.id}
                                            sx={{
                                                p: 3,
                                                mb: 3,
                                                bgcolor: "background.paper",
                                                borderRadius: 2,
                                                border: "1px solid",
                                                borderColor: "divider",
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 600, color: "primary.main", mb: 1 }}>Турнир: {fb.tournamentId}</Typography>
                                            <Rating value={fb.rating} readOnly size="medium" sx={{ mb: 1 }} />
                                            <Typography sx={{ fontSize: "1rem", mt: 1, lineHeight: 1.5 }}>{fb.text}</Typography>
                                            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 1 }}>{formatTimestamp(fb.created_at)}</Typography>
                                        </Paper>
                                    ))
                                )}
                            </Box>

                            {tournamentTotalPages > 1 && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                                    <Pagination
                                        count={tournamentTotalPages}
                                        page={tournamentCurrentPage + 1}
                                        onChange={handleTournamentPageChange}
                                        color="primary"
                                        size="large"
                                        showFirstButton
                                        showLastButton
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
