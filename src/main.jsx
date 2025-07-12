import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NotFound from "./routes/NotFound";
import Profile from "./routes/Profile";
import Home from "./routes/Home";
import Feedback from "./routes/Feedback";
import AdminUserFeedbacks from "./routes/AdminUserFeedbacks";
import Login from "./routes/Login";
import Register from "./routes/Register";
import ChatList from "./routes/ChatList";
import Chat from "./routes/Chat";
import CreateChat from "./routes/CreateChat";
import { CookiesProvider } from "react-cookie";
import darkTheme from "./theme";
import { ThemeProvider } from "@emotion/react";
import { AuthProvider } from "./layouts/AuthProvider";
import ProtectedLayout from "./layouts/ProtectedLayout";
import { CustomNavigateProvider } from "./components/CustomNavigateProvider";

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

                                    <Route path="/chats" element={<ChatList />} />
                                    <Route path="/chat/create" element={<CreateChat />} />
                                    <Route path="/chat/:chatId/:chatName" element={<Chat />} />
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
