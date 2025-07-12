import { useState, useEffect, useMemo } from 'react';
import { getProfile } from '../constants';
import { AuthContext } from '../AuthContext';

// Mock user data for demo purposes
const mockUser = {
  "id": "5375dc7e-8ef7-4384-b95a-9cddf4b713e2",
  "name": "Alexandr05",
  "surname": "Gileta",
  "patronymic": null,
  "phoneNumber": "88005553535",
  "email": "gileta_tenis3@ya.ru",
  "hashedPassword": "$2a$10$iXbqsAYjp40ZHP74dqzACemgeQAhnPP58fuxZGDiS3ePSXBxK2l9y",
  "dateOfBirth": null,
  "age": null,
  "sex": null,
  "weight": null,
  "height": null,
  "createdAt": "2025-07-09T15:46:17.189333",
  "bio": null,
  "avatarUrl": null,
  "admin": true
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in Authorization header first, then localStorage
    let token = null;
    
    if (typeof window !== 'undefined') {
      const header = window?.Authorization || window?.authorization;
      if (header && header.startsWith('Bearer ')) {
        token = header.replace('Bearer ', '');
      } else {
        token = localStorage.getItem('accessToken') || '123123';
      }
    }
    
    setAccessToken(token);

    if (token) {
      // Fetch user profile
      getProfile(token)
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          // If token is invalid, remove it from localStorage
          localStorage.removeItem('accessToken');
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
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    accessToken,
    user,
    loading,
    setAuthData,
    logout,
  }), [accessToken, user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 