import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isModerator: boolean;
  cityMode: string;
  setCityMode: (mode: string) => void;
  login: (emailOrUsername: string, pass: string) => Promise<void>;
  register: (email: string, username: string, pass: string, fullName?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('citylife_token'));
  const [cityMode, setCityMode] = useState<string>('tourist');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
        } catch (err) {
          localStorage.removeItem('citylife_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (emailOrUsername: string, pass: string) => {
    const data = await api.login(emailOrUsername, pass);
    localStorage.setItem('citylife_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (email: string, username: string, pass: string, fullName?: string) => {
    const data = await api.register(email, username, pass, fullName);
    localStorage.setItem('citylife_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('citylife_token');
    setToken(null);
    setUser(null);
  };

  const isModerator = user?.role === 'moderator' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isModerator,
        cityMode,
        setCityMode,
        login,
        register,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
