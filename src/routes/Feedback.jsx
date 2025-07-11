import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Rating from "@mui/material/Rating";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  getMatchFeedback,
  postMatchFeedback,
  getTournamentFeedback,
  postTournamentFeedback,
  getUserById,
  formatTimestamp,
} from "../constants";
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

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let res;
      if (type === "match") {
        res = await getMatchFeedback(id, accessToken);
      } else if (type === "tournament") {
        res = await getTournamentFeedback(id, accessToken);
      } else {
        setError("Некорректный тип отзыва");
        setFeedbacks(mockFeedbacks);
        setLoading(false);
        return;
      }
      setFeedbacks(res.data);
      
      // Fetch user info for each feedback
      const uniqueUserIds = Array.from(new Set(res.data.map(fb => fb.userId).filter(Boolean)));
      const infos = {};
      await Promise.all(uniqueUserIds.map(async (uid) => {
        try {
          const userRes = await getUserById(uid, accessToken);
          infos[uid] = userRes.data;
        } catch {
          infos[uid] = null;
        }
      }));
      setUserInfos(infos);
    } catch {
      setFeedbacks(mockFeedbacks);
      setError("Ошибка загрузки отзывов, показаны тестовые данные");
    } finally {
      setLoading(false);
    }
  }, [id, type, accessToken]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

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
        await fetchFeedbacks();
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 1, sm: 2 },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 5 },
          textAlign: "center",
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: "background.paper",
          border: "2px solid",
          borderColor: "divider",
          boxShadow: 6,
          minWidth: { xs: "90vw", sm: 400 },
          maxWidth: 600,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "primary.main",
            mb: { xs: 2, sm: 3 },
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          Отзывы
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "stretch",
            width: "100%",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              bgcolor: "transparent",
              border: "none",
              p: 0,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "primary.main",
                mb: 1,
                fontWeight: 600,
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                textAlign: "left",
              }}
            >
              Оставьте свой отзыв
            </Typography>
            {error && (
              <Typography color="error" sx={{ mb: 1 }}>
                {error}
              </Typography>
            )}
            <TextField
              label="Ваш отзыв"
              multiline
              minRows={2}
              maxRows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              required
              size="small"
            />
            <Rating
              name="rating"
              value={rating}
              onChange={(_, value) => setRating(value)}
              size="medium"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={sending || !text || !rating}
              sx={{ mt: 1, fontWeight: 600 }}
            >
              {sending ? "Отправка..." : "Отправить"}
            </Button>
          </Box>
          <Box
            sx={{
              maxHeight: 350,
              minHeight: 200,
              overflowY: "auto",
              textAlign: "left",
              bgcolor: "transparent",
              border: "none",
              p: 0,
            }}
          >
            {loading ? (
              <Typography color="text.secondary">Загрузка...</Typography>
            ) : feedbacks.length === 0 ? (
              <Typography color="text.secondary">Пока нет отзывов</Typography>
            ) : (
              feedbacks.map((fb) => (
                <Paper
                  key={fb.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "primary.main", display: 'flex', alignItems: 'center', gap: 1 }}>
                    {userInfos[fb.userId]?.avatarUrl && (
                      <Avatar src={userInfos[fb.userId].avatarUrl} alt={userInfos[fb.userId].name || fb.userId + "_avatar"} sx={{ width: 24, height: 24 }} />
                    )}
                    {userInfos[fb.userId]?.name || fb.userId || "Пользователь"}
                  </Typography>
                  <Rating value={fb.rating} readOnly size="small" />
                  <Typography sx={{ fontSize: "0.95rem", mt: 1 }}>
                    {fb.text}
                  </Typography>
                  <Typography
                    sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 0.5 }}
                  >
                    {formatTimestamp(fb.created_at)}
                  </Typography>
                </Paper>
              ))
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
