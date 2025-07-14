import { useEffect, useMemo, useState } from "react";
import { getProfile } from "../../constants.js";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in Authorization header first, then localStorage
        let token = null;

        if (typeof window !== "undefined") {
            const header = window?.Authorization || window?.authorization;
            if (header && header.startsWith("Bearer ")) {
                token = header.replace("Bearer ", "");
            } else {
                token = localStorage.getItem("accessToken");
            }
        }

        setAccessToken(token);

        if (token) {
            // Fetch user profile
            getProfile(token)
                .then((res) => {
                    setUser(res.data);
                })
                .catch(() => {
                    // If token is invalid, remove it from localStorage
                    localStorage.removeItem("accessToken");
                    setAccessToken(null);
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const setAuthData = ({ accessToken: newToken, user: newUser, loading: newLoading }) => {
        setAccessToken(newToken);
        setUser(newUser);
        setLoading(newLoading);
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        setAccessToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            accessToken,
            user,
            loading,
            setAuthData,
            logout,
        }),
        [accessToken, user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
