import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NotFound from "./routes/NotFound";
import Profile from "./routes/Profile";
import Home from "./routes/Home";
import Feedback from "./routes/Feedback";
import { CookiesProvider } from "react-cookie";
import darkTheme from "./theme";
import { ThemeProvider } from "@emotion/react";
import AuthProvider from "./layouts/AuthProvider";
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
                <Route element={<ProtectedLayout />}>
                  <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/feedback" element={<Feedback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CustomNavigateProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </CookiesProvider>
  </StrictMode>
);
