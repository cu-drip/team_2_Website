import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  MenuItem,
  Chip,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PeopleIcon from "@mui/icons-material/People";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TableChartIcon from "@mui/icons-material/TableChart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useAuth } from "../../contexts/auth/AuthContext.js";
import {
  formatTimestamp,
  getBracket,
  getTourMatches,
  getTournament,
  getTournamentParticipants,
  getUserById,
  registerParticipant,
  unregisterParticipant,
  getTeams,
  getTeamParticipants,
  createTour,
} from "../../constants.js";
import { useCustomNavigate } from "../../contexts/navigation/useCustomNavigate.js";

const CARD_HEIGHT = 150;
const CARD_GAP = 32;

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
      {value === index && (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

export default function TournamentDetails() {
  const { id } = useParams();
  const { accessToken, user } = useAuth();
  const navigate = useCustomNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]); // may contain ids or objects
  const [participantInfos, setParticipantInfos] = useState({});
  const [matches, setMatches] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [bracketEl, setBracketEl] = useState(null);
  const [tab, setTab] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [userTeams, setUserTeams] = useState([]); // Teams where user is a member
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  
  // New state for Competition Engine integration
  const [tournamentExistsInEngine, setTournamentExistsInEngine] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineError, setEngineError] = useState(null);

  // Check if current user is registered
  const checkRegistrationStatus = () => {
    if (!user?.id || !participants.length) return;
    const userIsRegistered = participants.some((p) => {
      const participantId = typeof p === "string" ? p : p.id;
      return participantId === user.id;
    });
    setIsRegistered(userIsRegistered);
  };

  useEffect(() => {
    checkRegistrationStatus();
  }, [participants, user?.id]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      setEngineError(null);
      try {
        // Only fetch teams if tournament type is team
        const promises = [
          getTournament(id, accessToken).catch(() => null),
          getTournamentParticipants(id, accessToken).catch(() => null),
        ];

        const [tourRes, partRes] = await Promise.all(promises);

        if (cancelled) return;
        if (!tourRes) throw new Error("tournament");

        const tournamentData = tourRes.data;
        setTournament(tournamentData);

        // Only fetch teams if tournament type is team
        if (tournamentData?.typeTournament === "team") {
          try {
            const teamsRes = await getTeams(accessToken);
            const teamsData = Array.isArray(teamsRes?.data) ? teamsRes.data : [];

            // Get user's teams (where user is a member)
            const userTeamsData = [];
            for (const team of teamsData) {
              try {
                const teamParticipantsRes = await getTeamParticipants(team.id, accessToken);
                const teamParticipants = Array.isArray(teamParticipantsRes?.data) ? teamParticipantsRes.data : [];
                const isUserMember = teamParticipants.some(p => {
                  const participantId = typeof p === "string" ? p : p.id;
                  return participantId === user?.id;
                });
                if (isUserMember) {
                  userTeamsData.push({
                    ...team,
                    currentParticipants: teamParticipants.length,
                    maxParticipants: team.maxParticipants || 11,
                  });
                }
              } catch {
                // Skip teams where we can't fetch participants
              }
            }
            setUserTeams(userTeamsData);
          } catch {
            // Handle teams fetch error
          }
        }

        const partArray = Array.isArray(partRes?.data) ? partRes.data : [];
        setParticipants(partArray);
        // fetch participant infos if array contains id strings
        const idsToFetch = partArray
          .filter((p) => typeof p === "string")
          .slice(0, 20); // limit
        const infos = {};
        await Promise.all(
          idsToFetch.map(async (pid) => {
            try {
              const res = await getUserById(pid, accessToken);
              infos[pid] = res.data;
            } catch {
              // ignore
            }
          })
        );
        setParticipantInfos(infos);

        // Check if tournament exists in Competition Engine
        try {
          await getBracket(id, accessToken);
          setTournamentExistsInEngine(true);
          
          // If tournament exists in engine, fetch matches and bracket
          const [matchRes, bracketRes] = await Promise.all([
            getTourMatches(id, accessToken).catch(() => ({ data: [] })),
            getBracket(id, accessToken).catch(() => ({ data: null })),
          ]);
          
          setMatches(Array.isArray(matchRes?.data) ? matchRes.data : []);
          setBracket(bracketRes?.data || null);
        } catch (err) {
          if (err.response?.status === 404) {
            setTournamentExistsInEngine(false);
            setMatches([]);
            setBracket(null);
          } else {
            // Other error, still try to fetch matches and bracket
            setTournamentExistsInEngine(true);
            const [matchRes, bracketRes] = await Promise.all([
              getTourMatches(id, accessToken).catch(() => ({ data: [] })),
              getBracket(id, accessToken).catch(() => ({ data: null })),
            ]);
            setMatches(Array.isArray(matchRes?.data) ? matchRes.data : []);
            setBracket(bracketRes?.data || null);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Ошибка загрузки данных, показываю демо");

          // Check if this is a team tournament demo
          if (id === "team-tournament-demo") {
            setTournament({
              title: "Team Football Championship",
              sport: "FOOTBALL",
              description: "Командный турнир по футболу",
              startTime: new Date().toISOString(),
              entryCost: 500,
              typeTournament: "team",
              maxParticipants: 16,
            });
          } else {
            setTournament({
              title: "Demo Tournament",
              sport: "FOOTBALL",
              description: "Тестовый турнир",
              startTime: new Date().toISOString(),
              entryCost: 0,
              typeTournament: "solo",
            });
          }

          // 32 участника — 5 раундов (16-8-4-2-1)
          const ids = Array.from(
            { length: 32 },
            (_, i) =>
              `00000000-0000-0000-0000-${(i + 1).toString().padStart(12, "0")}`
          );

          setParticipants(ids);

          setParticipantInfos(
            Object.fromEntries(
              ids.map((id, i) => [id, { name: `Player ${i + 1}` }])
            )
          );

          // Add demo teams for team tournaments
          if (id === "team-tournament-demo") {
            const demoTeams = [
              {
                id: "team-1",
                name: "Alpha Team",
                description: "Профессиональная команда по футболу",
                sport: "FOOTBALL",
                maxParticipants: 11,
                currentParticipants: 8,
              },
              {
                id: "team-2",
                name: "Beta Squad",
                description: "Команда по футболу",
                sport: "FOOTBALL",
                maxParticipants: 11,
                currentParticipants: 10,
              },
              {
                id: "team-3",
                name: "Gamma Force",
                description: "Футбольная команда",
                sport: "FOOTBALL",
                maxParticipants: 11,
                currentParticipants: 6,
              },
            ];
            // Assume user is member of first two teams for demo
            setUserTeams(demoTeams.slice(0, 2).map(team => ({
              ...team,
              currentParticipants: team.currentParticipants || 0,
              maxParticipants: team.maxParticipants || 11,
            })));
          }

          // Demo matches and bracket
          const makeId = (n) =>
            `aaaaaaaa-aaaa-aaaa-aaaa-${n.toString().padStart(12, "0")}`;

          // раунд-1 (16 матчей)
          const r1 = ids.reduce((acc, pid, idx) => {
            if (idx % 2) {
              const a = ids[idx - 1];
              const b = pid;
              acc.push({
                id: makeId(acc.length + 1),
                plannedStartTime: new Date().toISOString(),
                participants: [
                  { id: a, score: 2 },
                  { id: b, score: 1 },
                ],
                winner: a,
                status: "finished",
                parentMatches: [],
              });
            }
            return acc;
          }, []);

          // раунд-2 (8 матчей)
          const r2 = Array.from({ length: 8 }, (_, i) => {
            const pA = r1[i * 2];
            const pB = r1[i * 2 + 1];
            const winner = pA.winner;
            return {
              id: makeId(16 + i + 1),
              plannedStartTime: new Date().toISOString(),
              participants: [
                { id: pA.winner, score: 2 },
                { id: pB.winner, score: 0 },
              ],
              winner,
              status: "finished",
              parentMatches: [pA.id, pB.id],
            };
          });

          // раунд-3 (4 матча)
          const r3 = Array.from({ length: 4 }, (_, i) => {
            const pA = r2[i * 2];
            const pB = r2[i * 2 + 1];
            const winner = pA.winner;
            return {
              id: makeId(24 + i + 1),
              plannedStartTime: new Date().toISOString(),
              participants: [
                { id: pA.winner, score: 2 },
                { id: pB.winner, score: 1 },
              ],
              winner,
              status: "finished",
              parentMatches: [pA.id, pB.id],
            };
          });

          // раунд-4 (2 матча)
          const r4 = Array.from({ length: 2 }, (_, i) => {
            const pA = r3[i * 2];
            const pB = r3[i * 2 + 1];
            const winner = pA.winner;
            return {
              id: makeId(28 + i + 1),
              plannedStartTime: new Date().toISOString(),
              participants: [
                { id: pA.winner, score: 2 },
                { id: pB.winner, score: 0 },
              ],
              winner,
              status: "finished",
              parentMatches: [pA.id, pB.id],
            };
          });

          // финал (1 матч)
          const final = {
            id: makeId(31),
            plannedStartTime: new Date().toISOString(),
            participants: [
              { id: r4[0].winner, score: null },
              { id: r4[1].winner, score: null },
            ],
            winner: null,
            status: "prepared",
            parentMatches: [r4[0].id, r4[1].id],
          };

          setMatches([...r1, ...r2, ...r3, ...r4, final]);

          setBracket({
            typeTournament: "solo",
            typeGroup: "OLYMPIC",
            matches: [...r1, ...r2, ...r3, ...r4, final].map((m) => m.id),
          });
          
          // Demo tournaments exist in engine
          setTournamentExistsInEngine(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (accessToken) fetchData();
    return () => {
      cancelled = true;
    };
  }, [id, accessToken, user?.id]);

  // Handle registration
  const handleRegister = async () => {
    if (!user?.id) {
      setError("Необходимо войти в систему для регистрации");
      return;
    }

    // Check if tournament exists in engine - if it does, registration is closed
    if (tournamentExistsInEngine) {
      setError("Регистрация закрыта - турнир уже создан в системе соревнований и матчи сформированы.");
      return;
    }

    // For team tournaments, check if user has teams
    if (tournament?.typeTournament === "team") {
      if (userTeams.length === 0) {
        setError("Вы не являетесь участником ни одной команды. Присоединитесь к команде для регистрации на командный турнир.");
        return;
      }
      setShowTeamSelection(true);
      return;
    }

    setRegistrationLoading(true);
    setError(null);

    try {
      await registerParticipant(
        id,
        user.id,
        tournament?.typeTournament || "solo",
        accessToken
      );
      setIsRegistered(true);
      // Refresh participants list
      const partRes = await getTournamentParticipants(id, accessToken);
      const partArray = Array.isArray(partRes?.data) ? partRes.data : [];
      setParticipants(partArray);
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка регистрации на турнир");
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Handle team registration
  const handleTeamRegister = async () => {
    if (!selectedTeam) {
      setError("Выберите команду для регистрации");
      return;
    }

    // Check if tournament exists in engine - if it does, registration is closed
    if (tournamentExistsInEngine) {
      setError("Регистрация закрыта - турнир уже создан в системе соревнований и матчи сформированы.");
      setShowTeamSelection(false);
      return;
    }

    setRegistrationLoading(true);
    setError(null);

    try {
      await registerParticipant(id, selectedTeam, "team", accessToken);
      setIsRegistered(true);
      setShowTeamSelection(false);
      // Refresh participants list
      const partRes = await getTournamentParticipants(id, accessToken);
      const partArray = Array.isArray(partRes?.data) ? partRes.data : [];
      setParticipants(partArray);
    } catch (err) {
      setError(
        err.response?.data?.message || "Ошибка регистрации команды на турнир"
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Handle unregistration
  const handleUnregister = async () => {
    if (!user?.id) {
      setError("Необходимо войти в систему");
      return;
    }

    // Check if tournament exists in engine - if it does, unregistration is closed
    if (tournamentExistsInEngine) {
      setError("Отмена регистрации закрыта - турнир уже создан в системе соревнований и матчи сформированы.");
      return;
    }

    setRegistrationLoading(true);
    setError(null);

    try {
      await unregisterParticipant(
        id,
        user.id,
        tournament?.typeTournament || "solo",
        accessToken
      );
      setIsRegistered(false);
      // Refresh participants list
      const partRes = await getTournamentParticipants(id, accessToken);
      const partArray = Array.isArray(partRes?.data) ? partRes.data : [];
      setParticipants(partArray);
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка отмены регистрации");
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Handle creating tournament in Competition Engine (admin only)
  const handleCreateInEngine = async () => {
    if (!user?.admin) {
      setError("Только администраторы могут создавать турниры в системе соревнований");
      return;
    }

    setEngineLoading(true);
    setEngineError(null);

    try {
      await createTour({
        ...tournament,

        participants: participants,

        // TODO: remove this when backend fixed
        sport: tournament.sport.toUpperCase(),
        typeTournament: tournament.typeTournament.toUpperCase(),
        typeGroup: tournament.typeGroup.toUpperCase(), 
        startTime: tournament.startTime + "Z", 
        organizerId: tournament.organizedId,
      }, accessToken);
      
      // Refresh engine status
      setTournamentExistsInEngine(true);
      
      // Fetch matches and bracket
      const [matchRes, bracketRes] = await Promise.all([
        getTourMatches(id, accessToken).catch(() => ({ data: [] })),
        getBracket(id, accessToken).catch(() => ({ data: null })),
      ]);
      
      setMatches(Array.isArray(matchRes?.data) ? matchRes.data : []);
      setBracket(bracketRes?.data || null);
      
    } catch (err) {
      setEngineError(err.response?.data?.message || "Ошибка создания турнира в системе соревнований");
    } finally {
      setEngineLoading(false);
    }
  };

  useEffect(() => {
    const prepareBracket = () => {
      if (!bracket || bracket.typeGroup !== "OLYMPIC") return null;

      const rounds = [];
      let prev = matches.filter((m) => m.parentMatches.length === 0);
      let next = matches.filter((m) => m.parentMatches.length > 0);
      rounds.push(prev);

      let depth = 0;
      while (next.length && depth < 10) {
        depth++;
        const curr = next.filter((m) =>
          rounds[rounds.length - 1].some((pm) =>
            m.parentMatches.includes(pm.id)
          )
        );
        rounds.push(curr);
        next = next.filter((m) => !curr.includes(m));
      }
      return rounds;
    };

    const rounds = prepareBracket();
    if (!rounds) return;

    const generateArrows = (index) => {
      let nextRound = rounds[index + 1];
      if (!nextRound) return [];

      let currentLenght = rounds[index].length;

      let list = [];
      for (let i = 0; i < nextRound.length; i++) {
        list.push(
          <Box
            key={i * 2}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              bgcolor: "transparent",
            }}
          >
            <Box
              sx={{
                width: `${CARD_GAP / 2}px`,
                height: `${(CARD_HEIGHT * rounds[0].length) / currentLenght}px`,
                borderColor: "textColor.primary",
                borderStyle: "solid",
                borderWidth: "1px",
                borderLeftWidth: "0px",
              }}
            ></Box>
            <Box
              sx={{
                width: `${CARD_GAP / 2}px`,
                height: `0px`,
                borderColor: "textColor.primary",
                borderStyle: "solid",
                borderWidth: "1px",
                borderLeftWidth: "0px",
                borderTopWidth: 0,
              }}
            ></Box>
          </Box>
        );
      }

      return list;
    };

    const elm = (
      <Box
        sx={{
          width: "fit-content",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
        }}
      >
        {rounds.map((round, ri) => (
          <>
            <Box
              sx={{
                display: "flex",
                height: `${CARD_HEIGHT * rounds[0].length}px`,
                flexDirection: "column",
                justifyContent: "space-around",
                mr: "8px",
              }}
            >
              {round.map((m) => (
                <Card
                  key={m.id}
                  variant="outlined"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    width: 160,
                    height: CARD_HEIGHT,
                    p: 1,
                    boxShadow: 1,
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {formatTimestamp(m.plannedStartTime, "HH:mm")}
                    </Typography>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="body2" noWrap>
                      {participantInfos[m.participants[0].id]?.name ||
                        m.participants[0].id}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {participantInfos[m.participants[1].id]?.name ||
                        m.participants[1].id}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 0.5, textAlign: "center" }}
                    >
                      {m.participants[0].score ?? "-"} :{" "}
                      {m.participants[1].score ?? "-"}
                    </Typography>
                    {m.status === "finished" && (
                      <Typography
                        variant="caption"
                        sx={{
                          textAlign: "center",
                          display: "block",
                          mt: 0.5,
                          color: "success.main",
                        }}
                      >
                        Winner: {participantInfos[m.winner]?.name || m.winner}
                      </Typography>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
            <Box
              key={ri}
              sx={{
                display: "flex",
                height: `${CARD_HEIGHT * rounds[0].length}px`,
                flexDirection: "column",
                justifyContent: "space-around",
                mr: "8px",
              }}
            >
              {generateArrows(ri)}
            </Box>
          </>
        ))}
      </Box>
    );
    setBracketEl(elm);
  }, [bracket, matches, participantInfos]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tournament) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        Турнир не найден
      </Alert>
    );
  }

  const getParticipantLabel = (pIdOrObj) => {
    if (typeof pIdOrObj === "string") {
      return participantInfos[pIdOrObj]?.name || pIdOrObj;
    }
    return pIdOrObj.name || pIdOrObj.id;
  };

  const renderScore = (match) => {
    if (!Array.isArray(match.participants) || match.participants.length < 2)
      return "-";
    const sA = match.participants[0].score ?? "-";
    const sB = match.participants[1].score ?? "-";
    return `${sA} - ${sB}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        onClick={() => navigate("/tournaments")}
        sx={{ mb: 3, fontWeight: 600 }}
      >
        Назад
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {tournament.title}
        </Typography>
        {user?.admin && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => navigate(`/admin/tournaments`)}
              sx={{ fontWeight: 600 }}
              color="secondary"
            >
              Управление турниром
            </Button>
            <Button
              variant="outlined"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => navigate(`/admin/matches?tournamentId=${id}`)}
              sx={{ fontWeight: 600 }}
              color="primary"
            >
              Управление матчами
            </Button>
            {!tournamentExistsInEngine && (
              <Button
                variant="outlined"
                startIcon={<PlayArrowIcon />}
                onClick={handleCreateInEngine}
                disabled={engineLoading}
                sx={{ fontWeight: 600 }}
                color="success"
              >
                {engineLoading ? "Создание..." : "Создать в системе"}
              </Button>
            )}
          </Box>
        )}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {engineError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {engineError}
        </Alert>
      )}

      <Card sx={{ mb: 4, boxShadow: 4, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <SportsSoccerIcon fontSize="large" color="primary" />
            </Grid>
            <Grid item xs>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Информация
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {tournament.description || "—"}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[
              ["Вид спорта", tournament.sport],
              ["Начало", formatTimestamp(tournament.startTime)],
              ["Участников", participants.length],
              [
                "Стоимость",
                tournament.entryCost ? `${tournament.entryCost}₽` : "—",
              ],
            ].map(([label, value]) => (
              <Grid key={label} item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {value ?? "—"}
                </Typography>
              </Grid>
            ))}
          </Grid>
          
          {/* Engine Status */}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Статус системы:
            </Typography>
            <Chip
              label={tournamentExistsInEngine ? "Активен" : "Регистрация открыта"}
              color={tournamentExistsInEngine ? "success" : "info"}
              size="small"
              variant="outlined"
            />
            {tournamentExistsInEngine ? (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (Матчи и сетка доступны, регистрация закрыта)
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (Матчи и сетка недоступны, регистрация открыта)
              </Typography>
            )}
          </Box>
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
            {user?.id ? (
              <>
                {isRegistered ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<PersonRemoveIcon />}
                    onClick={handleUnregister}
                    disabled={registrationLoading || tournamentExistsInEngine}
                    sx={{ fontWeight: 600 }}
                  >
                    {registrationLoading ? "Отмена..." : "Отменить регистрацию"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PersonAddIcon />}
                    onClick={handleRegister}
                    disabled={registrationLoading || tournamentExistsInEngine}
                    sx={{ fontWeight: 600 }}
                  >
                    {registrationLoading
                      ? "Регистрация..."
                      : tournament?.typeTournament === "team"
                      ? "Зарегистрировать команду"
                      : "Зарегистрироваться"}
                  </Button>
                )}
                {isRegistered && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ fontWeight: 600 }}
                  >
                    ✓ Вы зарегистрированы
                  </Typography>
                )}
                {tournamentExistsInEngine && (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{ fontWeight: 600 }}
                  >
                    ⚠ Регистрация закрыта - турнир создан в системе соревнований
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Войдите в систему для регистрации на турнир
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 4, borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, newVal) => {
            // Prevent switching to disabled tabs
            if (newVal === 1 || newVal === 2) {
              if (!tournamentExistsInEngine) {
                return;
              }
            }
            setTab(newVal);
          }}
          variant="fullWidth"
          indicatorColor="primary"
        >
          <Tab
            icon={<PeopleIcon />}
            label={`Участники (${participants.length})`}
          />
          <Tab 
            icon={<TableChartIcon />} 
            label={`Матчи (${matches.length})`}
            disabled={!tournamentExistsInEngine}
          />
          <Tab 
            icon={<FormatListNumberedIcon />} 
            label="Сетка"
            disabled={!tournamentExistsInEngine}
          />
        </Tabs>

        <TabPanel value={tab} index={0}>
          {participants.length === 0 ? (
            <Typography color="text.secondary">Пока нет участников</Typography>
          ) : (
            <List sx={{ width: "100%" }}>
              {participants.map((p, idx) => {
                const id = typeof p === "string" ? p : p.id;
                const label = getParticipantLabel(p);
                return (
                  <ListItem
                    key={id || idx}
                    sx={{ mb: 1, borderRadius: 1, boxShadow: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar>{label[0]?.toUpperCase() || "U"}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={label} secondary={id} />
                  </ListItem>
                );
              })}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1}>
          {!tournamentExistsInEngine ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Турнир не создан в системе соревнований
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Матчи будут доступны после создания турнира в системе соревнований.
                {user?.admin && " Используйте кнопку 'Создать в системе' выше."}
              </Typography>
            </Box>
          ) : matches.length === 0 ? (
            <Typography color="text.secondary">Пока нет матчей</Typography>
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>A</TableCell>
                    <TableCell>B</TableCell>
                    <TableCell align="center">Счёт</TableCell>
                    <TableCell align="center">Начало</TableCell>
                    <TableCell align="center">Окончание</TableCell>
                    <TableCell align="center">Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>{m.id}</TableCell>
                      <TableCell>
                        {getParticipantLabel(m.participants?.[0]?.id || "—")}
                      </TableCell>
                      <TableCell>
                        {getParticipantLabel(m.participants?.[1]?.id || "—")}
                      </TableCell>
                      <TableCell align="center">{renderScore(m)}</TableCell>
                      <TableCell align="center">
                        {m.plannedStartTime
                          ? formatTimestamp(m.plannedStartTime)
                          : "—"}
                      </TableCell>
                      <TableCell align="center">
                        {m.plannedEndTime
                          ? formatTimestamp(m.plannedEndTime)
                          : "—"}
                      </TableCell>
                      <TableCell align="center">{m.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tab} index={2}>
          {!tournamentExistsInEngine ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Турнир не создан в системе соревнований
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Сетка будет доступна после создания турнира в системе соревнований.
                {user?.admin && " Используйте кнопку 'Создать в системе' выше."}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                overflowX: "auto",
                px: 1,
                /* webkit */
                "&::-webkit-scrollbar": { height: 8 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "primary.main",
                  borderRadius: 4,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "background.default",
                },
                /* firefox */
                scrollbarWidth: "thin",
                scrollbarColor: "primary.main transparent",
              }}
            >
              {bracket ? (
                bracketEl
              ) : (
                <Typography color="text.secondary">Сетка недоступна</Typography>
              )}
            </Box>
          )}
        </TabPanel>
      </Card>

      {/* Team Selection Dialog */}
      <Dialog
        open={showTeamSelection}
        onClose={() => setShowTeamSelection(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Выберите команду для регистрации</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Выберите команду, участником которой вы являетесь:
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Команда</InputLabel>
            <Select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              label="Команда"
            >
              {userTeams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name} ({team.currentParticipants}/{team.maxParticipants}{" "}
                  участников)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTeamSelection(false)}>Отмена</Button>
          <Button
            onClick={handleTeamRegister}
            variant="contained"
            disabled={!selectedTeam || registrationLoading}
          >
            {registrationLoading
              ? "Регистрация..."
              : "Зарегистрировать команду"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
