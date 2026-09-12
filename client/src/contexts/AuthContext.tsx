import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  directLogin: (email: string) => Promise<{ user: User; token: string }>;
  googleLogin: (email: string, name?: string, avatarUrl?: string | null) => Promise<{ user: User; token: string; is_new_user: boolean }>;
  signInWithGoogle: () => Promise<void>;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string; delivered_via_smtp?: boolean; smtp_error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ user: User; token: string; is_new_user: boolean }>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('hh_token');
    const storedUser = localStorage.getItem('hh_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      authApi.me()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('hh_token');
          localStorage.removeItem('hh_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('hh_token', newToken);
    localStorage.setItem('hh_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return { user: newUser, token: newToken };
  };

  const directLogin = async (email: string) => {
    const res = await authApi.directLogin(email);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('hh_token', newToken);
    localStorage.setItem('hh_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return { user: newUser, token: newToken };
  };

  const googleLogin = async (email: string, name?: string, avatarUrl?: string | null) => {
    const res = await authApi.googleLogin(email, name, avatarUrl);
    const { token: newToken, user: newUser, is_new_user } = res.data;
    localStorage.setItem('hh_token', newToken);
    localStorage.setItem('hh_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return { user: newUser, token: newToken, is_new_user: !!is_new_user };
  };

  const signInWithGoogle = async () => {
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const sendOtp = async (email: string) => {
    const res = await authApi.sendOtp(email);
    return res.data;
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await authApi.verifyOtp(email, otp);
    const { token: newToken, user: newUser, is_new_user } = res.data;
    localStorage.setItem('hh_token', newToken);
    localStorage.setItem('hh_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return { user: newUser, token: newToken, is_new_user: !!is_new_user };
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await authApi.updateProfile(data);
    const updatedUser = res.data;
    localStorage.setItem('hh_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem('hh_token');
    localStorage.removeItem('hh_user');
    setToken(null);
    setUser(null);
    supabase.auth.signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, token, login, directLogin, googleLogin, signInWithGoogle, sendOtp, verifyOtp, updateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
