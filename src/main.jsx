import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NotFound from "./routes/NotFound";
import Profile from "./routes/auth/Profile.jsx";
import Home from "./routes/Home";
import Feedback from "./routes/feedback/Feedback.jsx";
import AdminUserFeedbacks from "./routes/feedback/AdminUserFeedbacks.jsx";
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

                                    <Route path="/feedback/match/:id" element={<Feedback type="match" />} />
                                    <Route path="/feedback/tournament/:id" element={<Feedback type="tournament" />} />
                                    <Route path="/admin/feedback/:userId" element={<AdminUserFeedbacks />} />

                                    <Route path="/chats" element={<UnifiedChat />} />
                                    <Route path="/chats/:chatId/:chatName" element={<UnifiedChat />} />
                                    <Route path="/chat/create" element={<CreateChat />} />
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
