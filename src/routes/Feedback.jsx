import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Rating from "@mui/material/Rating";
import Pagination from "@mui/material/Pagination";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { formatTimestamp, getMatchFeedback, getTournamentFeedback, getUserById, postMatchFeedback, postTournamentFeedback } from "../constants";
import Avatar from "@mui/material/Avatar";

const mockFeedbacks = [
    {
        id: "1",
        userId: "user1",
        text: "Отличная игра!",
        rating: 5,
        created_at: "2024-07-01T10:30:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
    {
        id: "2",
        userId: "user2",
        text: "Было интересно, но можно лучше.",
        rating: 4,
        created_at: "2024-07-02T14:45:00.000000",
    },
];

export default function Feedback({ type }) {
    const { id } = useParams();
    const { user, accessToken } = useAuth();

    const [feedbacks, setFeedbacks] = useState([]);
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfos, setUserInfos] = useState({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(20);

    const fetchFeedbacks = useCallback(
        async (page = 0) => {
            setLoading(true);
            setError(null);

            try {
                let res;
                if (type === "match") {
                    res = await getMatchFeedback(id, accessToken, page, pageSize);
                } else if (type === "tournament") {
                    res = await getTournamentFeedback(id, accessToken, page, pageSize);
                } else {
                    setError("Некорректный тип отзыва");
                    setFeedbacks(mockFeedbacks);
                    setLoading(false);
                    return;
                }

                // Handle paginated response
                const responseData = res.data;
                setFeedbacks(responseData.content || []);
                setTotalPages(responseData.totalPages || 0);
                setTotalElements(responseData.totalElements || 0);
                setCurrentPage(responseData.number || 0);

                // Fetch user info for each feedback
                const uniqueUserIds = Array.from(new Set(responseData.content?.map((fb) => fb.userId).filter(Boolean) || []));
                const infos = {};
                await Promise.all(
                    uniqueUserIds.map(async (uid) => {
                        try {
                            const userRes = await getUserById(uid, accessToken);
                            infos[uid] = userRes.data;
                        } catch {
                            infos[uid] = null;
                        }
                    })
                );
                setUserInfos(infos);
            } catch {
                setFeedbacks(mockFeedbacks);
                setError("Ошибка загрузки отзывов, показаны тестовые данные");
            } finally {
                setLoading(false);
            }
        },
        [id, type, accessToken, pageSize]
    );

    useEffect(() => {
        fetchFeedbacks(0);
    }, [fetchFeedbacks]);

    const handlePageChange = (event, newPage) => {
        const pageIndex = newPage - 1; // Convert to 0-based index
        setCurrentPage(pageIndex);
        fetchFeedbacks(pageIndex);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSending(true);
        setError(null);

        try {
            let res;
            if (type === "match") {
                res = await postMatchFeedback(
                    {
                        userId: user?.id,
                        matchId: id,
                        text,
                        rating,
                    },
                    accessToken
                );
            } else if (type === "tournament") {
                res = await postTournamentFeedback(
                    {
                        userId: user?.id,
                        tournamentId: id,
                        text,
                        rating,
                    },
                    accessToken
                );
            } else {
                setError("Некорректный тип отзыва");
                setFeedbacks(mockFeedbacks);
                setSending(false);
                return;
            }

            if (res && (res.status === 201 || res.status === 200)) {
                await fetchFeedbacks(0); // Refresh first page after posting
                setText("");
                setRating(0);
            }
        } catch {
            setError("Ошибка отправки отзыва, показаны тестовые данные");
            setFeedbacks(mockFeedbacks);
        } finally {
            setSending(false);
        }
    };

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
                }}
            >
                Отзывы
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    maxWidth: "1200px",
                    mx: "auto",
                }}
            >
                {/* Input Section */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", pb: 3, mb: 3 }}>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            bgcolor: "transparent",
                            border: "none",
                            p: 0,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: "primary.main",
                                mb: 0.5,
                                fontWeight: 600,
                                fontSize: { xs: "1rem", sm: "1.1rem" },
                                textAlign: "left",
                            }}
                        >
                            Оставьте свой отзыв
                        </Typography>
                        {error && (
                            <Typography color="error" sx={{ mb: 0.5, fontSize: "0.9rem" }}>
                                {error}
                            </Typography>
                        )}
                        <TextField label="Ваш отзыв" multiline minRows={2} maxRows={3} value={text} onChange={(e) => setText(e.target.value)} fullWidth required size="small" />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Оценка:
                            </Typography>
                            <Rating name="rating" value={rating} onChange={(_, value) => setRating(value)} size="medium" />
                        </Box>
                        <Button type="submit" variant="contained" color="primary" disabled={sending || !text || !rating} sx={{ mt: 1, fontWeight: 600, py: 1 }} size="medium">
                            {sending ? "Отправка..." : "Отправить"}
                        </Button>
                    </Box>
                </Box>

                {/* Feedback List Section */}
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "primary.main",
                                fontWeight: 600,
                                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                            }}
                        >
                            Все отзывы
                        </Typography>
                        {totalElements > 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Всего: {totalElements} отзывов
                            </Typography>
                        )}
                    </Box>

                    <Box
                        sx={{
                            maxHeight: "50vh",
                            overflowY: "auto",
                            textAlign: "left",
                            bgcolor: "transparent",
                            border: "none",
                            p: 0,
                            mb: 3,
                        }}
                    >
                        {loading ? (
                            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                                Загрузка...
                            </Typography>
                        ) : feedbacks.length === 0 ? (
                            <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                                Пока нет отзывов
                            </Typography>
                        ) : (
                            feedbacks.map((fb) => (
                                <Paper
                                    key={fb.id}
                                    sx={{
                                        p: 3,
                                        mb: 3,
                                        bgcolor: "background.default",
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 600, color: "primary.main", display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        {userInfos[fb.userId]?.avatarUrl && (
                                            <Avatar src={userInfos[fb.userId].avatarUrl} alt={userInfos[fb.userId].name || fb.userId + "_avatar"} sx={{ width: 28, height: 28 }} />
                                        )}
                                        {userInfos[fb.userId]?.name || fb.userId || "Пользователь"}
                                    </Typography>
                                    <Rating value={fb.rating} readOnly size="medium" sx={{ mb: 1 }} />
                                    <Typography sx={{ fontSize: "1rem", mt: 1, lineHeight: 1.5 }}>{fb.text}</Typography>
                                    <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 1 }}>{formatTimestamp(fb.created_at)}</Typography>
                                </Paper>
                            ))
                        )}
                    </Box>

                    {totalPages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage + 1} // Convert to 1-based for Pagination component
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
