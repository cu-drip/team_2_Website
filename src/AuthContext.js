import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  accessToken: null,
  user: null,
});

export const useAuth = () => useContext(AuthContext); 