import { useEffect, useMemo, useState } from "react";
import { getProfile } from "../../constants.js";
import { AuthContext } from "./AuthContext.js";

// Mock user data for demo purposes
const mockUser = {
    "id": "9ab9a5d6-6183-4dc0-985e-bb45bc8a261e",
    "name": "Legenda",
    "surname": "Gachi",
    "patronymic": "Muchi",
    "phoneNumber": "+79164700635",
    "email": "loshara@axorom.ru",
    "hashedPassword": "$2a$10$KBH5R4SdlvZH3jr6RpWt0OMs37OOcQp0AAh9Qxl22Jswd.tNvTXh6",
    "dateOfBirth": null,
    "age": null,
    "sex": "MALE",
    "weight": null,
    "height": null,
    "createdAt": "2025-07-13T20:38:29.039685",
    "bio": null,
    "avatarUrl": "https://pic.rutubelist.ru/video/2024-11-30/92/73/92738020d441b41983088ef387969610.jpg",
    "mmr": 100,
    "admin": true
};

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
                token = localStorage.getItem("accessToken") || "123123";
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
                    //setAccessToken(null);
                    setUser(mockUser); // TODO: remove mock user
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
