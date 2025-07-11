import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getAdminUserMatchFeedback, getAdminUserTournamentFeedback, getUserById, formatTimestamp } from "../constants";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Avatar from "@mui/material/Avatar";
import { useCustomNavigate } from "../components/useCustomNavigate";

const mockMatchFeedbacks = [
  {
    id: "1",
    userId: "user1",
    matchId: "match1",
    text: "Матч был отличным!",
    rating: 5,
    created_at: "2024-07-01T10:30:00.000000",
    type: "match",
  },
];
const mockTournamentFeedbacks = [
  {
    id: "2",
    userId: "user1",
    tournamentId: "tournament1",
    text: "Турнир понравился!",
    rating: 4,
    created_at: "2024-07-02T14:45:00.000000",
    type: "tournament",
  },
];

export default function AdminUserFeedbacks() {
  const { userId } = useParams();
  const { user, accessToken } = useAuth();
  const [matchFeedbacks, setMatchFeedbacks] = useState([]);
  const [tournamentFeedbacks, setTournamentFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const customNavigate = useCustomNavigate();

  useEffect(() => {
    async function fetchFeedbacks() {
      setLoading(true);
      setError(null);
      try {
        const [matchRes, tournamentRes, userRes] = await Promise.all([
          getAdminUserMatchFeedback(userId, accessToken),
          getAdminUserTournamentFeedback(userId, accessToken),
          getUserById(userId, accessToken),
        ]);
        setMatchFeedbacks(matchRes.data);
        setTournamentFeedbacks(tournamentRes.data);
        setUserInfo(userRes.data);
      } catch {
        setMatchFeedbacks(mockMatchFeedbacks);
        setTournamentFeedbacks(mockTournamentFeedbacks);
        setUserInfo(null);
        setError("Ошибка загрузки отзывов, показаны тестовые данные");
      } finally {
        setLoading(false);
      }
    }
    if (user?.admin) {
      fetchFeedbacks();
    } else {
      customNavigate("/");
    }
  }, [userId, accessToken, user, customNavigate]);

  if (!user?.admin) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Typography color="error" variant="h6">Доступ только для администраторов</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "background.default", p: { xs: 1, sm: 2 } }}>
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 5 }, textAlign: "center", borderRadius: { xs: 2, sm: 3 }, bgcolor: "background.paper", border: "2px solid", borderColor: "divider", boxShadow: 6, minWidth: { xs: "90vw", sm: 400 }, maxWidth: 600 }}>
        <Typography variant="h5" sx={{ color: "primary.main", mb: 1, fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2rem" }, display: 'flex', alignItems: 'center', gap: 1 }}>
          {userInfo?.avatarUrl && (
            <Avatar src={userInfo.avatarUrl} alt={userInfo?.name || "Аватар"} sx={{ width: 32, height: 32 }} />
          )}
          {userInfo?.name ? `${userInfo.name} (${userInfo.email || userId})` : `Отзывы Пользователя (admin)`}
        </Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <Typography variant="h6" sx={{ color: "primary.main", mb: 1, fontWeight: 600, fontSize: { xs: "1.1rem", sm: "1.3rem" } }}>
          Отзывы о матчах
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: "auto", textAlign: "left", mb: 3, bgcolor: "background.default", borderRadius: 2, border: "1px solid", borderColor: "divider", p: 2 }}>
          {loading ? (
            <Typography color="text.secondary">Загрузка...</Typography>
          ) : matchFeedbacks.length === 0 ? (
            <Typography color="text.secondary">Пока нет отзывов</Typography>
          ) : (
            matchFeedbacks.map((fb) => (
              <Paper key={fb.id} sx={{ p: 2, mb: 2, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography sx={{ fontWeight: 600, color: "primary.main" }}>Матч: {fb.matchId}</Typography>
                <Rating value={fb.rating} readOnly size="small" />
                <Typography sx={{ fontSize: "0.95rem", mt: 1 }}>{fb.text}</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 0.5 }}>{formatTimestamp(fb.created_at)}</Typography>
              </Paper>
            ))
          )}
        </Box>
        <Typography variant="h6" sx={{ color: "primary.main", mb: 1, fontWeight: 600, fontSize: { xs: "1.1rem", sm: "1.3rem" } }}>
          Отзывы о турнирах
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: "auto", textAlign: "left", bgcolor: "background.default", borderRadius: 2, border: "1px solid", borderColor: "divider", p: 2 }}>
          {loading ? (
            <Typography color="text.secondary">Загрузка...</Typography>
          ) : tournamentFeedbacks.length === 0 ? (
            <Typography color="text.secondary">Пока нет отзывов</Typography>
          ) : (
            tournamentFeedbacks.map((fb) => (
              <Paper key={fb.id} sx={{ p: 2, mb: 2, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography sx={{ fontWeight: 600, color: "primary.main" }}>Турнир: {fb.tournamentId}</Typography>
                <Rating value={fb.rating} readOnly size="small" />
                <Typography sx={{ fontSize: "0.95rem", mt: 1 }}>{fb.text}</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 0.5 }}>{formatTimestamp(fb.created_at)}</Typography>
              </Paper>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
} 