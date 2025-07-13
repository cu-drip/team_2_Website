import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { getTeams, getTeamParticipants } from "../../constants.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";
import { formatTimestamp } from "../../constants.js";

export default function Teams() {
  const { accessToken } = useAuth();
  const navigate = useCustomNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getTeams(accessToken);
        const teamsData = Array.isArray(res.data) ? res.data : [];

        // Fetch participants for each team to get current count
        const teamsWithParticipants = await Promise.all(
          teamsData.map(async (team) => {
            try {
              const participantsRes = await getTeamParticipants(
                team.id,
                accessToken
              );
              const participants = Array.isArray(participantsRes.data)
                ? participantsRes.data
                : [];
              return {
                ...team,
                currentParticipants: participants.length,
                maxParticipants: team.maxParticipants || 11, // Default max participants
              };
            } catch {
              // If we can't fetch participants, use default values
              return {
                ...team,
                currentParticipants: 0,
                maxParticipants: team.maxParticipants || 11,
              };
            }
          })
        );

        setTeams(teamsWithParticipants);
      } catch {
        setError("Ошибка загрузки команд, показываю демо");
        setTeams([
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            name: "Alpha Team",
            description: "Профессиональная команда по футболу",
            sport: "FOOTBALL",
            maxParticipants: 11,
            currentParticipants: 8,
            createdAt: "2024-01-15T10:00:00Z",
            owner: "user1",
          },
          {
            id: "123e4567-e89b-12d3-a456-426614174002",
            name: "Beta Squad",
            description: "Команда по баскетболу",
            sport: "BASKETBALL",
            maxParticipants: 12,
            currentParticipants: 10,
            createdAt: "2024-02-20T14:30:00Z",
            owner: "user2",
          },
          {
            id: "123e4567-e89b-12d3-a456-426614174003",
            name: "Gamma Force",
            description: "Теннисная команда",
            sport: "TENNIS",
            maxParticipants: 8,
            currentParticipants: 6,
            createdAt: "2024-03-10T09:15:00Z",
            owner: "user3",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) fetchData();
  }, [accessToken]);

  // Handle card click (navigate to team details)
  const handleCardClick = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  const getSportIcon = (sport) => {
    switch (sport) {
      case "FOOTBALL":
        return "⚽";
      case "BASKETBALL":
        return "🏀";
      case "TENNIS":
        return "🎾";
      default:
        return "🏆";
    }
  };

  const getSportLabel = (sport) => {
    switch (sport) {
      case "FOOTBALL":
        return "Футбол";
      case "BASKETBALL":
        return "Баскетбол";
      case "TENNIS":
        return "Теннис";
      default:
        return sport;
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Все команды
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teams/create")}
          sx={{ fontWeight: 600 }}
        >
          Создать команду
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {teams.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 4 }}>
              Нет доступных команд
            </Typography>
          ) : (
            teams.map((team) => (
              <Grid
                item
                key={team.id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                sx={{ width: "100%", maxWidth: "400px" }}
              >
                <Card sx={{ height: "100%", boxShadow: 4, borderRadius: 2 }}>
                  <CardActionArea onClick={() => handleCardClick(team.id)}>
                    <CardHeader
                      avatar={
                        <Avatar
                          sx={{ bgcolor: "primary.main", fontSize: "1.2rem" }}
                        >
                          {getSportIcon(team.sport)}
                        </Avatar>
                      }
                      title={team.name}
                      subheader={formatTimestamp(team.createdAt)?.slice(0, 10)}
                      titleTypographyProps={{
                        variant: "h6",
                        noWrap: true,
                        sx: { fontWeight: 600 },
                      }}
                    />
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                        noWrap
                      >
                        {team.description}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{ mb: 2 }}
                      >
                        <Chip
                          icon={<GroupIcon />}
                          label={`${team.currentParticipants || 0}/${
                            team.maxParticipants || 11
                          } участников`}
                          size="small"
                          color={
                            (team.currentParticipants || 0) ===
                            (team.maxParticipants || 11)
                              ? "success"
                              : "default"
                          }
                        />
                        <Chip
                          icon={<PeopleIcon />}
                          label={getSportLabel(team.sport)}
                          size="small"
                        />
                      </Stack>

                      {/* Team Status */}
                      <Box sx={{ mt: 2 }}>
                        {(team.currentParticipants || 0) ===
                        (team.maxParticipants || 11) ? (
                          <Chip
                            label="Команда укомплектована"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Chip
                            label="Есть свободные места"
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
}
