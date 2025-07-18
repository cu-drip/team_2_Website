import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NotFound from "./routes/NotFound";
import Profile from "./routes/auth/Profile.jsx";
import Home from "./routes/Home";
import Feedback from "./routes/feedback/Feedback.jsx";
import FeedbackEntry from "./routes/feedback/FeedbackEntry.jsx";
import AdminUserFeedbacks from "./routes/feedback/AdminUserFeedbacks.jsx";
import AdminFeedbackEntry from "./routes/feedback/AdminFeedbackEntry.jsx";
import AdminDashboard from "./routes/admin/AdminDashboard.jsx";
import MatchAdmin from "./routes/admin/MatchAdmin.jsx";
import TournamentAdmin from "./routes/admin/TournamentAdmin.jsx";
import Login from "./routes/auth/Login.jsx";
import Register from "./routes/auth/Register.jsx";
import UnifiedChat from "./routes/chat/UnifiedChat.jsx";
import CreateChat from "./routes/chat/CreateChat";
import { CookiesProvider } from "react-cookie";
import darkTheme from "./theme";
import { ThemeProvider } from "@emotion/react";
import { AuthProvider } from "./contexts/auth/AuthProvider.jsx";
import ProtectedLayout from "./layouts/ProtectedLayout";
import { CustomNavigateProvider } from "./contexts/navigation/CustomNavigateProvider.jsx";
import Tournaments from "./routes/tournaments/Tournaments.jsx";
import TournamentDetails from "./routes/tournaments/TournamentDetails.jsx";
import CreateTournament from "./routes/tournaments/CreateTournament.jsx";
import Teams from "./routes/teams/Teams.jsx";
import TeamDetails from "./routes/teams/TeamDetails.jsx";
import CreateTeam from "./routes/teams/CreateTeam.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <CookiesProvider>
            <ThemeProvider theme={darkTheme}>
                <AuthProvider>
                    <BrowserRouter>
                        <CustomNavigateProvider>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                <Route element={<ProtectedLayout />}>
                                    <Route path="/profile" element={<Profile />} />

                                    <Route path="/tournaments" element={<Tournaments />} />
                                    <Route path="/tournaments/create" element={<CreateTournament />} />
                                    <Route path="/tournaments/:id" element={<TournamentDetails />} />

                                    <Route path="/teams" element={<Teams />} />
                                    <Route path="/teams/create" element={<CreateTeam />} />
                                    <Route path="/teams/:id" element={<TeamDetails />} />

                                    <Route path="/feedback" element={<FeedbackEntry />} />
                                    <Route path="/feedback/match/:id" element={<Feedback type="match" />} />
                                    <Route path="/feedback/tournament/:id" element={<Feedback type="tournament" />} />

                                    <Route path="/chats" element={<UnifiedChat />} />
                                    <Route path="/chats/:chatId/:chatName" element={<UnifiedChat />} />
                                    <Route path="/chat/create" element={<CreateChat />} />

                                    <Route path="/admin" element={<AdminDashboard />} />
                                    <Route path="/admin/matches" element={<MatchAdmin />} />
                                    <Route path="/admin/tournaments" element={<TournamentAdmin />} />
                                    <Route path="/admin/feedback" element={<AdminFeedbackEntry />} />
                                    <Route path="/admin/feedback/:userId" element={<AdminUserFeedbacks />} />
                                </Route>

                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </CustomNavigateProvider>
                    </BrowserRouter>
                </AuthProvider>
            </ThemeProvider>
        </CookiesProvider>
    </StrictMode>
);
