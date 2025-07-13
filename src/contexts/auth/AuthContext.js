import { createContext, useContext } from "react";

export const AuthContext = createContext({
    accessToken: null,
    user: null,
    loading: true,
    setAuthData: () => {},
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);
