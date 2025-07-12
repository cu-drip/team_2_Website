import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useCustomNavigate } from "../components/useCustomNavigate";

export default function NotFound() {
    const customNavigate = useCustomNavigate();

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                bgcolor: "background.default",
                p: { xs: 1, sm: 2 },
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    p: { xs: 2, sm: 5 },
                    textAlign: "center",
                    borderRadius: { xs: 2, sm: 3 },
                    bgcolor: "background.paper",
                    border: "2px solid",
                    borderColor: "divider",
                    boxShadow: 3,
                    minWidth: { xs: "90vw", sm: 340 },
                    maxWidth: 400,
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: "2.5rem", sm: "4rem" },
                        m: 0,
                        color: "primary.main",
                    }}
                >
                    404
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        fontSize: { xs: "1rem", sm: "1.2rem" },
                        mt: 2,
                        mb: 4,
                        color: "text.secondary",
                    }}
                >
                    Страница не найдена
                </Typography>
                <Button variant="contained" color="primary" size="large" fullWidth sx={{ py: 1.5, fontWeight: 600, fontSize: { xs: "1rem", sm: "1.1rem" } }} onClick={() => customNavigate("/")}>
                    Вернуться на главную
                </Button>
            </Paper>
        </Box>
    );
}
