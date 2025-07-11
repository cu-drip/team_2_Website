import React, { useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../AuthContext';
import { getProfile } from '../constants';

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token = null;
    if (typeof window !== 'undefined') {
      const header = window?.Authorization || window?.authorization;
      if (header && header.startsWith('Bearer ')) {
        token = header.replace('Bearer ', '');
      } else {
        token = window.localStorage.getItem('accessToken');
      }
    }
    setAccessToken(token);
    if (token) {
      getProfile(token)
        .then(res => setUser(res.data))
        // Mock data
        // TODO: remove mocks for production
        .catch(() => setUser({
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
        }))
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ accessToken, user, loading }), [accessToken, user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 