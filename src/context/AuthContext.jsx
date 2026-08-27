import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLoginSync, loginUser as apiLoginUser, registerUser as apiRegisterUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pantrypal_user');
    const savedToken = localStorage.getItem('pantrypal_token');
    const savedGoogleToken = localStorage.getItem('pantrypal_google_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedGoogleToken || savedToken);
    }
    setLoading(false);
  }, []);

  const loginWithBackend = (userData, backendToken, googleToken = null) => {
    setUser(userData);
    setAccessToken(googleToken || backendToken);
    localStorage.setItem('pantrypal_user', JSON.stringify(userData));
    localStorage.setItem('pantrypal_token', backendToken);
    if (googleToken) {
      localStorage.setItem('pantrypal_google_token', googleToken);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('pantrypal_user');
    localStorage.removeItem('pantrypal_token');
    localStorage.removeItem('pantrypal_google_token');
  };

  const register = async (name, email, password) => {
    try {
      const data = await apiRegisterUser(name, email, password);
      loginWithBackend(data.user, data.token);
    } catch (err) {
      if (err.message === 'NETWORK_ERROR') {
        const localUser = { id: Date.now(), name, email };
        const localToken = 'local-offline-token-' + Date.now();
        loginWithBackend(localUser, localToken);
        return;
      }
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const data = await apiLoginUser(email, password);
      loginWithBackend(data.user, data.token);
    } catch (err) {
      if (err.message === 'NETWORK_ERROR') {
        const localUser = { id: Date.now(), name: email.split('@')[0], email };
        const localToken = 'local-offline-token-' + Date.now();
        loginWithBackend(localUser, localToken);
        return;
      }
      throw err;
    }
  };

  const syncGoogleLogin = async (userInfo, googleAccessToken) => {
    try {
      const data = await googleLoginSync(userInfo);
      loginWithBackend(data.user, data.token, googleAccessToken);
    } catch (err) {
      // Fallback to local session if backend sync fails
      const localUser = {
        id: userInfo.sub || Date.now(),
        name: userInfo.name || 'Google User',
        email: userInfo.email,
        picture: userInfo.picture
      };
      const localToken = 'local-google-token-' + Date.now();
      loginWithBackend(localUser, localToken, googleAccessToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, syncGoogleLogin, register, loginWithEmail, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
