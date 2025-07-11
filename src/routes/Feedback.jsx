import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Rating from "@mui/material/Rating";


const mockFeedbacks = [
  {
    id: "1",
    user: "User1",
    text: "Отличная игра!",
    rating: 5,
    created_at: "2024-07-01",
  },
  {
    id: "2",
    user: "User2",
    text: "Было интересно, но можно лучше.",
    rating: 4,
    created_at: "2024-07-02",
  },
];

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState(mockFeedbacks);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // отправка на сервер
    setTimeout(() => {
      setFeedbacks([
        ...feedbacks,
        {
          id: Date.now().toString(),
          user: "Вы",
          text,
          rating,
          created_at: new Date().toISOString().slice(0, 10),
        },
      ]);
      setText("");
      setRating(0);
      setSending(false);
    }, 500);
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
          minWidth: { xs: "90vw", sm: 340 },
          maxWidth: 400,
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
          Оставьте свой отзыв
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}
        >
          <TextField
            label="Ваш отзыв"
            multiline
            minRows={2}
            maxRows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
            required
          />
          <Rating
            name="rating"
            value={rating}
            onChange={(_, value) => setRating(value)}
            size="large"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={sending || !text || !rating}
          >
            {sending ? "Отправка..." : "Отправить"}
          </Button>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: "primary.main",
            mb: 2,
            fontWeight: 600,
            fontSize: { xs: "1.1rem", sm: "1.3rem" },
          }}
        >
          Отзывы
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: "auto", textAlign: "left" }}>
          {feedbacks.length === 0 && (
            <Typography color="text.secondary">Пока нет отзывов</Typography>
          )}
          {feedbacks.map((fb) => (
            <Paper
              key={fb.id}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "background.default",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography sx={{ fontWeight: 600, color: "primary.main" }}>
                {fb.user}
              </Typography>
              <Rating value={fb.rating} readOnly size="small" />
              <Typography sx={{ fontSize: "0.95rem", mt: 1 }}>
                {fb.text}
              </Typography>
              <Typography
                sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 0.5 }}
              >
                {fb.created_at}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
