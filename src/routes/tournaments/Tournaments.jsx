import { useEffect, useState } from "react";
import {
  Box,
  Container,
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
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import { getTournaments, getBracket } from "../../constants.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";
import { formatTimestamp } from "../../constants.js";

const sportIcons = {
  FOOTBALL: <SportsSoccerIcon />,
  TENNIS: <SportsTennisIcon />,
  BASKETBALL: <SportsBasketballIcon />,
};

export default function Tournaments() {
  const { accessToken } = useAuth();
  const navigate = useCustomNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineStatuses, setEngineStatuses] = useState({});

  // Check if tournament exists in Competition Engine
  const checkTournamentEngineStatus = async (tournamentId) => {
    try {
      await getBracket(tournamentId, accessToken);
      return true; // Tournament exists in engine
    } catch (err) {
      if (err.response?.status === 404) {
        // Tournament doesn't exist in engine
        return false;
      }
      // TODO: Tournament bug in backend, fixed tomorrow?
      return true;
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getTournaments(accessToken);
        const tournamentsData = Array.isArray(res.data) ? res.data : [];
        setTournaments(tournamentsData);

        // Check engine status for each tournament
        const statuses = {};
        await Promise.all(
          tournamentsData.map(async (tournament) => {
            const existsInEngine = await checkTournamentEngineStatus(
              tournament.id
            );
            statuses[tournament.id] = existsInEngine;
          })
        );
        setEngineStatuses(statuses);
      } catch {
        setError("Ошибка загрузки турниров, показываю демо");
        const demoTournaments = [
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            title: "City Football Championship",
            description: "Ежегодный турнир среди любительских команд",
            sport: "FOOTBALL",
            typeTournament: "team",
            typeGroup: "olympic",
            matchesNumber: 16,
            startTime: "2024-05-10T14:00:00Z",
            entryCost: 1000.0,
            maxParticipants: 32,
          },
          {
            id: "team-tournament-demo",
            title: "Team Football Championship",
            description: "Командный турнир по футболу",
            sport: "FOOTBALL",
            typeTournament: "team",
            typeGroup: "olympic",
            matchesNumber: 8,
            startTime: "2024-06-15T10:00:00Z",
            entryCost: 500.0,
            maxParticipants: 16,
          },
          {
            id: "123e4567-e89b-12d3-a456-426614174003",
            title: "Tennis Masters Cup",
            description: "Престижный одиночный теннисный турнир",
            sport: "TENNIS",
            typeTournament: "solo",
            typeGroup: "round_robin",
            matchesNumber: 8,
            startTime: "2024-03-01T12:00:00Z",
            entryCost: 500.0,
            maxParticipants: 8,
          },
        ];
        setTournaments(demoTournaments);

        // Demo engine statuses - some tournaments exist in engine, others don't
        setEngineStatuses({
          "123e4567-e89b-12d3-a456-426614174001": true, // Registration closed
          "team-tournament-demo": false, // Registration open
          "123e4567-e89b-12d3-a456-426614174003": true, // Registration closed
        });
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) fetchData();
  }, [accessToken]);

  // Handle card click (navigate to tournament details)
  const handleCardClick = (tournamentId) => {
    navigate(`/tournaments/${tournamentId}`);
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
          Все турниры
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/tournaments/create")}
          sx={{ fontWeight: 600 }}
        >
          Создать турнир
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
          {tournaments.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 4 }}>
              Нет доступных турниров
            </Typography>
          ) : (
            tournaments.map((tour) => {
              const existsInEngine = engineStatuses[tour.id];
              const registrationOpen = !existsInEngine;

              return (
                <Grid
                  item
                  key={tour.id}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  sx={{ height: "100%", width: "100%", maxWidth: "400px" }}
                >
                  <Card
                    sx={{
                      boxShadow: 4,
                      borderRadius: 2,
                    }}
                  >
                    <CardActionArea onClick={() => handleCardClick(tour.id)}>
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {sportIcons[tour.sport] || <SportsEsportsIcon />}
                          </Avatar>
                        }
                        title={tour.title}
                        subheader={formatTimestamp(tour.startTime)?.slice(
                          0,
                          10
                        )}
                        titleTypographyProps={{
                          variant: "h6",
                          noWrap: true,
                          sx: { fontWeight: 600 },
                        }}
                      />
                      <Box sx={{ px: 2, pb: 1 }}>
                        <Chip
                          icon={
                            registrationOpen ? <LockOpenIcon /> : <LockIcon />
                          }
                          label={
                            registrationOpen
                              ? "Регистрация открыта"
                              : "Регистрация закрыта"
                          }
                          color={registrationOpen ? "success" : "warning"}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            "& .MuiChip-label": {
                              px: { xs: 1, sm: 1.5 },
                            },
                            "& .MuiChip-icon": {
                              fontSize: { xs: "0.8rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Box>
                      <CardContent>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                          noWrap
                        >
                          {tour.description}
                        </Typography>
                        <Stack
                          direction="column"
                          spacing={1}
                          flexWrap="wrap"
                          sx={{ mb: 2 }}
                        >
                          <Box>
                            <Chip
                              icon={<PeopleIcon />}
                              label={`${tour.maxParticipants} участников`}
                              size="small"
                            />
                            <Chip
                              icon={<EventIcon />}
                              label={tour.typeGroup}
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Chip
                              icon={<CalendarTodayIcon />}
                              label={`${tour.matchesNumber} матчей`}
                              size="small"
                            />
                            <Chip
                              icon={<AttachMoneyIcon />}
                              label={
                                tour.entryCost != null
                                  ? `${tour.entryCost}₽`
                                  : "Бесплатно"
                              }
                              size="small"
                            />
                            {tour.typeTournament === "team" && (
                              <Chip
                                icon={<GroupIcon />}
                                label="Командный"
                                size="small"
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 2, textAlign: "center" }}
                        >
                          Нажмите для просмотра деталей
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}
    </Box>
  );
}
