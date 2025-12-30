// context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Helper: check if JWT is expired
  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token);
      return Date.now() >= exp * 1000; // exp is in seconds
    } catch (err) {
      return true; // treat invalid token as expired
    }
  };

  // Load user + tokens from localStorage when the app starts
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccess = localStorage.getItem('access_token');
    const storedRefresh = localStorage.getItem('refresh_token');

    if (storedUser && storedAccess) {
      if (!isTokenExpired(storedAccess)) {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
      } else {
        console.warn("Access token expired, clearing storage");
        logout();
      }
    }
  }, []);

  const saveAuth = (userData, access, refresh) => {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, refreshToken, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
