import { useAuth } from "../AuthContext";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function renderUserFields(user) {
    if (!user || typeof user !== "object") return null;
    return Object.entries(user).map(([key, value]) => (
        <Box key={key} sx={{ display: "flex", mb: 1, flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 600, minWidth: 100, color: "primary.main", mr: 1 }}>{key}:</Typography>
            <Typography sx={{ color: "text.primary", wordBreak: "break-word" }}>
                {typeof value === "object" && value !== null ? (
                    Array.isArray(value) ? (
                        value.length === 0 ? (
                            "[]"
                        ) : (
                            <Box component="span" sx={{ ml: 1 }}>
                                [
                                {value.map((v, i) => (
                                    <Box component="span" key={i} sx={{ ml: 0.5 }}>
                                        {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                                        {i < value.length - 1 ? "," : ""}
                                    </Box>
                                ))}
                                ]
                            </Box>
                        )
                    ) : (
                        <pre style={{ display: "inline", margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
                    )
                ) : (
                    String(value)
                )}
            </Typography>
        </Box>
    ));
}

export default function Profile() {
    const { user } = useAuth();

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
                <Typography variant="h5" sx={{ color: "primary.main", mb: { xs: 2, sm: 3 }, fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                    User profile
                </Typography>
                <Box sx={{ textAlign: "left", bgcolor: "background.default", borderRadius: 1, p: 2, fontSize: { xs: "0.9rem", sm: "1rem" }, overflowX: "auto" }}>{renderUserFields(user)}</Box>
            </Paper>
        </Box>
    );
}
